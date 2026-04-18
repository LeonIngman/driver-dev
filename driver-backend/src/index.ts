import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda'
import { sql, initDb } from './db.js'
import {
  createAppJwt,
  exchangeCodeForToken,
  getUser,
  getUserPrimaryEmail,
  getInstallationRepos,
  getRepoIssues,
} from './github.js'
import developers from './developers.js'
import companies from './companies.js'

const app = new Hono()

app.use('*', cors())

// Initialize DB tables on startup
initDb().catch(console.error)

/** Root — also handles GitHub OAuth callback when redirect_uri points here */
app.get('/', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

  if (code && state === 'developer') {
    const { access_token } = await exchangeCodeForToken(code)
    const [ghUser, primaryEmail] = await Promise.all([
      getUser(access_token) as Promise<{ id: number; login: string; email: string | null; name: string | null }>,
      getUserPrimaryEmail(access_token),
    ])
    const email = ghUser.email ?? primaryEmail ?? ''

    const [dev] = await sql`
      INSERT INTO developers (github_id, username, email, first_name, last_name)
      VALUES (
        ${String(ghUser.id)},
        ${ghUser.login},
        ${email},
        ${ghUser.name?.split(' ')[0] ?? ghUser.login},
        ${ghUser.name?.split(' ').slice(1).join(' ') ?? ''}
      )
      ON CONFLICT (github_id) DO UPDATE SET
        username = EXCLUDED.username,
        email = CASE WHEN developers.email = '' THEN EXCLUDED.email ELSE developers.email END
      RETURNING id, anthropic_api_key
    `

    if (dev.anthropic_api_key) {
      return c.redirect(`${frontendUrl}/repos`)
    }

    return c.redirect(`${frontendUrl}/developer/onboarding?id=${dev.id}`)
  }

  return c.text('Hello Hono!')
})

app.route('/developers', developers)
app.route('/companies', companies)

// ─── GitHub Auth ───────────────────────────────────────────

/**
 * GET /auth/github?role=developer  → GitHub OAuth (developer login)
 * GET /auth/github                 → GitHub App installation (company onboarding)
 */
app.get('/auth/github', (c) => {
  const role = c.req.query('role')

  if (role === 'developer') {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      scope: 'user:email',
      state: 'developer',
    })
    return c.redirect(`https://github.com/login/oauth/authorize?${params}`)
  }

  // Company onboarding: install the GitHub App
  const slug = process.env.GITHUB_APP_SLUG!
  return c.redirect(`https://github.com/apps/${slug}/installations/new`)
})

/**
 * GitHub redirects here for both flows:
 *
 * Developer OAuth:  ?code=...&state=developer
 * App installation: ?installation_id=...&setup_action=install
 */
app.get('/auth/github/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

  // ── Developer OAuth ──────────────────────────────────────
  if (code && state === 'developer') {
    const { access_token } = await exchangeCodeForToken(code)
    const [ghUser, primaryEmail] = await Promise.all([
      getUser(access_token) as Promise<{ id: number; login: string; email: string | null; name: string | null }>,
      getUserPrimaryEmail(access_token),
    ])
    const email = ghUser.email ?? primaryEmail ?? ''

    const [dev] = await sql`
      INSERT INTO developers (github_id, username, email, first_name, last_name)
      VALUES (
        ${String(ghUser.id)},
        ${ghUser.login},
        ${email},
        ${ghUser.name?.split(' ')[0] ?? ghUser.login},
        ${ghUser.name?.split(' ').slice(1).join(' ') ?? ''}
      )
      ON CONFLICT (github_id) DO UPDATE SET
        username = EXCLUDED.username,
        email = CASE WHEN developers.email = '' THEN EXCLUDED.email ELSE developers.email END
      RETURNING id, anthropic_api_key
    `

    if (dev.anthropic_api_key) {
      return c.redirect(`${frontendUrl}/repos`)
    }

    return c.redirect(`${frontendUrl}/developer/onboarding?id=${dev.id}`)
  }

  // ── GitHub App installation (company onboarding) ─────────
  const installationId = Number(c.req.query('installation_id'))
  if (!installationId) return c.text('Missing installation_id or OAuth code', 400)

  const appJwt = createAppJwt()
  const res = await fetch(`https://api.github.com/app/installations/${installationId}`, {
    headers: { Authorization: `Bearer ${appJwt}`, Accept: 'application/vnd.github+json' },
  })
  const installation = await res.json() as {
    id: number
    account: { login: string; type: string }
  }

  let orgEmail: string | null = null
  if (installation.account.type === 'Organization') {
    const orgRes = await fetch(`https://api.github.com/orgs/${installation.account.login}`, {
      headers: { Authorization: `Bearer ${appJwt}`, Accept: 'application/vnd.github+json' },
    })
    const orgData = await orgRes.json() as { email?: string | null }
    orgEmail = orgData.email ?? null
  }

  const [company] = await sql`
    INSERT INTO companies (org_name, email, github_id)
    VALUES (${installation.account.login}, ${orgEmail}, ${String(installation.id)})
    ON CONFLICT (github_id) DO UPDATE SET
      org_name = EXCLUDED.org_name,
      email = EXCLUDED.email
    RETURNING id
  `

  console.log(`[companies] GitHub install persisted: id=${company.id} org=${installation.account.login} email=${orgEmail}`)

  await sql`
    INSERT INTO github_installations (installation_id, account_login, account_type, company_id)
    VALUES (${installation.id}, ${installation.account.login}, ${installation.account.type}, ${company.id})
    ON CONFLICT (installation_id) DO UPDATE SET
      account_login = EXCLUDED.account_login,
      company_id = EXCLUDED.company_id
  `

  return c.redirect(`${frontendUrl}/company/connect-repo?installation_id=${installationId}`)
})

// ─── Repo API ──────────────────────────────────────────────

/** List repos available on a given installation */
app.get('/api/repos', async (c) => {
  const installationId = Number(c.req.query('installation_id'))
  if (!installationId) return c.json({ error: 'installation_id required' }, 400)

  const data = await getInstallationRepos(installationId) as {
    repositories: Array<{
      id: number
      name: string
      full_name: string
      private: boolean
      language: string | null
      stargazers_count: number
      open_issues_count: number
      pushed_at: string
    }>
  }

  return c.json({
    repos: data.repositories.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      private: r.private,
      language: r.language,
      stars: r.stargazers_count,
      issues: r.open_issues_count,
      pushed_at: r.pushed_at,
    })),
  })
})

/** Connect (save) a repo */
app.post('/api/repos/connect', async (c) => {
  const { installation_id, repo_id, repo_full_name, private: isPrivate } =
    await c.req.json<{
      installation_id: number
      repo_id: number
      repo_full_name: string
      private: boolean
    }>()

  const [row] = await sql`
    INSERT INTO connected_repos (installation_id, repo_id, repo_full_name, private)
    VALUES (${installation_id}, ${repo_id}, ${repo_full_name}, ${isPrivate})
    ON CONFLICT (installation_id, repo_id) DO NOTHING
    RETURNING *
  `

  return c.json({ connected: row ?? null })
})

/** Disconnect a repo */
app.delete('/api/repos/connect', async (c) => {
  const { installation_id, repo_id } =
    await c.req.json<{ installation_id: number; repo_id: number }>()

  await sql`
    DELETE FROM connected_repos
    WHERE installation_id = ${installation_id} AND repo_id = ${repo_id}
  `

  return c.json({ ok: true })
})

/** List connected repos for an installation */
app.get('/api/repos/connected', async (c) => {
  const installationId = Number(c.req.query('installation_id'))
  if (!installationId) return c.json({ error: 'installation_id required' }, 400)

  const rows = await sql`
    SELECT * FROM connected_repos WHERE installation_id = ${installationId}
  `
  return c.json({ repos: rows })
})

/** List all installations */
app.get('/api/installations', async (c) => {
  const rows = await sql`SELECT * FROM github_installations ORDER BY created_at DESC`
  return c.json({ installations: rows })
})

// ─── Issues API ───────────────────────────────────────────

/** Fetch open issues from GitHub for all connected repos of an installation */
app.get('/api/issues', async (c) => {
  const installationId = Number(c.req.query('installation_id'))
  if (!installationId) return c.json({ error: 'installation_id required' }, 400)

  const connectedRepos = await sql`
    SELECT repo_full_name FROM connected_repos WHERE installation_id = ${installationId}
  `

  const allIssues: Array<{
    number: number
    title: string
    repo: string
    labels: string[]
    created_at: string
    html_url: string
  }> = []

  for (const repo of connectedRepos) {
    const issues = await getRepoIssues(installationId, repo.repo_full_name) as Array<{
      number: number
      title: string
      labels: Array<{ name: string }>
      created_at: string
      html_url: string
      pull_request?: unknown
    }>

    for (const issue of issues) {
      // GitHub's issues endpoint also returns PRs — skip them
      if (issue.pull_request) continue
      allIssues.push({
        number: issue.number,
        title: issue.title,
        repo: repo.repo_full_name,
        labels: issue.labels.map((l) => l.name),
        created_at: issue.created_at,
        html_url: issue.html_url,
      })
    }
  }

  return c.json({ issues: allIssues })
})

/** Save configured issues with salaries */
app.post('/api/issues/configure', async (c) => {
  const { installation_id, issues } = await c.req.json<{
    installation_id: number
    issues: Array<{
      repo_full_name: string
      issue_number: number
      title: string
      salary: number
      labels: string[]
    }>
  }>()

  for (const issue of issues) {
    await sql`
      INSERT INTO configured_issues (installation_id, repo_full_name, issue_number, title, salary, labels)
      VALUES (${installation_id}, ${issue.repo_full_name}, ${issue.issue_number}, ${issue.title}, ${issue.salary}, ${issue.labels})
      ON CONFLICT (installation_id, repo_full_name, issue_number) DO UPDATE SET
        title = EXCLUDED.title,
        salary = EXCLUDED.salary,
        labels = EXCLUDED.labels
    `
  }

  return c.json({ ok: true, count: issues.length })
})

export const handler = handle(app)
export default app
