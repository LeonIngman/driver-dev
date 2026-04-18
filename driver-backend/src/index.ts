import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda'
import { sql, initDb } from './db.js'
import {
  createAppJwt,
  getInstallationRepos,
  getRepoIssues,
} from './github.js'

const app = new Hono()

app.use('*', cors())

// Initialize DB tables on startup
initDb().catch(console.error)

app.get('/', (c) => c.text('Hello Hono!'))

// ─── GitHub OAuth ──────────────────────────────────────────

/** Redirect user to install the GitHub App on their org/account */
app.get('/auth/github', (c) => {
  const slug = process.env.GITHUB_APP_SLUG!
  return c.redirect(`https://github.com/apps/${slug}/installations/new`)
})

/**
 * After installation, GitHub redirects to the Setup URL (configured in your
 * GitHub App settings). Set that to:
 *   http://localhost:3001/auth/github/callback
 *
 * GitHub sends ?installation_id=123&setup_action=install
 */
app.get('/auth/github/callback', async (c) => {
  const installationId = Number(c.req.query('installation_id'))
  const setupAction = c.req.query('setup_action')

  if (!installationId) return c.text('Missing installation_id', 400)

  // Fetch installation details using the app JWT
  const appJwt = createAppJwt()
  const res = await fetch(`https://api.github.com/app/installations/${installationId}`, {
    headers: { Authorization: `Bearer ${appJwt}`, Accept: 'application/vnd.github+json' },
  })
  const installation = await res.json() as {
    id: number
    account: { login: string; type: string }
  }

  // Store the installation
  await sql`
    INSERT INTO github_installations (installation_id, account_login, account_type)
    VALUES (${installation.id}, ${installation.account.login}, ${installation.account.type})
    ON CONFLICT (installation_id) DO UPDATE SET
      account_login = EXCLUDED.account_login
  `

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
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
