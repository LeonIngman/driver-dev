import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { setCookie } from 'hono/cookie'
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

    setCookie(c, 'developer_id', String(dev.id), {
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 90,
    })

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

    setCookie(c, 'developer_id', String(dev.id), {
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 90,
    })

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

/** Developer marketplace stats */
app.get('/api/repos/stats', async (c) => {
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'open')                   AS "totalIssues",
      COALESCE(SUM(salary) FILTER (WHERE status = 'open'), 0)  AS "totalValue"
    FROM issues
  `
  return c.json({
    totalIssues: Number(row.totalIssues),
    totalValue:  Number(row.totalValue),
    activeDevs:  0,
  })
})

/**
 * Without installation_id → developer marketplace view (flat Repo[])
 * With    installation_id → company repo picker (raw GitHub data)
 */
app.get('/api/repos', async (c) => {
  const installationId = Number(c.req.query('installation_id'))

  // ── Company: list repos on a GitHub App installation ─────
  if (installationId) {
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
  }

  // ── Developer: marketplace view aggregated from DB ────────
  const rows = await sql`
    SELECT
      i.repo_full_name,
      gi.account_login,
      COUNT(*)                                                    AS issue_count,
      COALESCE(SUM(i.salary), 0)                                  AS total_value,
      COALESCE(AVG(i.salary), 0)                                  AS avg_salary,
      ARRAY_AGG(DISTINCT elem) FILTER (WHERE elem IS NOT NULL)    AS tags
    FROM issues i
    LEFT JOIN connected_repos cr
      ON cr.repo_full_name = i.repo_full_name
    LEFT JOIN github_installations gi
      ON gi.installation_id = cr.installation_id
    LEFT JOIN LATERAL UNNEST(i.labels) AS elem ON TRUE
    WHERE i.status = 'open'
    GROUP BY i.repo_full_name, gi.account_login
    ORDER BY total_value DESC
  `

  const repos = rows.map((r) => {
    const fullName = r.repo_full_name as string
    const repoName = fullName.split('/')[1] ?? fullName
    const org      = (r.account_login as string | null) ?? fullName.split('/')[0] ?? '?'
    return {
      org,
      orgInitial:  org.slice(0, 2).toUpperCase(),
      orgColor:    '#E86C2C',
      name:        repoName,
      description: '',
      lang:        '',
      langDot:     '',
      issues:      Number(r.issue_count),
      totalValue:  Number(r.total_value),
      avgSalary:   Math.round(Number(r.avg_salary)),
      devs:        0,
      stars:       0,
      tags:        (r.tags as string[] | null) ?? [],
    }
  })

  return c.json(repos)
})

/** Repo detail header */
app.get('/api/repos/:org/:repo', async (c) => {
  const { org, repo } = c.req.param()
  const fullName = `${org}/${repo}`

  const [inst] = await sql`
    SELECT gi.account_login
    FROM connected_repos cr
    JOIN github_installations gi ON gi.installation_id = cr.installation_id
    WHERE cr.repo_full_name = ${fullName}
    LIMIT 1
  `

  const tagRows = await sql`
    SELECT ARRAY_AGG(DISTINCT elem) FILTER (WHERE elem IS NOT NULL) AS tags
    FROM issues, LATERAL UNNEST(labels) AS elem
    WHERE repo_full_name = ${fullName}
  `

  const accountLogin = (inst?.account_login as string | null) ?? org
  return c.json({
    org:         accountLogin,
    orgInitial:  accountLogin.slice(0, 2).toUpperCase(),
    orgColor:    '#E86C2C',
    name:        repo,
    fullName,
    description: '',
    lang:        '',
    langDot:     '',
    stars:       0,
    tags:        (tagRows[0]?.tags as string[] | null) ?? [],
  })
})

/** Issues for a repo detail page */
app.get('/api/repos/:org/:repo/issues', async (c) => {
  const { org, repo } = c.req.param()
  const fullName = `${org}/${repo}`

  const rows = await sql`
    SELECT issue_number, title, status, labels, salary, updated_at
    FROM issues
    WHERE repo_full_name = ${fullName}
    ORDER BY
      CASE status WHEN 'open' THEN 0 WHEN 'claimed' THEN 1 WHEN 'in_review' THEN 2 ELSE 3 END,
      salary DESC
  `

  const issues = rows.map((r) => ({
    id:          String(r.issue_number),
    title:       r.title,
    status:      r.status as 'open' | 'claimed' | 'in_review' | 'completed',
    labels:      r.labels as string[],
    salary:      Number(r.salary),
    devs:        0,
    devInitials: [] as string[],
    devColors:   [] as string[],
    comments:    0,
    updated:     new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return c.json(issues)
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

// ─── Company Profile API ─────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Company profile — data for the logged-in company */
app.get('/api/company/profile', async (c) => {
  // TODO: use auth — for now, grab the first company
  const [company] = await sql`SELECT * FROM companies ORDER BY created_at ASC LIMIT 1`

  if (!company) {
    return c.json({ name: '—', initials: '?', plan: '—', slug: '' })
  }

  const slug = toSlug(company.org_name)
  const initials = company.org_name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return c.json({
    name: company.org_name,
    initials,
    plan: company.plan,
    slug,
  })
})

/** Company repos for sidebar */
app.get('/api/company/repos', async (c) => {
  // TODO: use auth — for now, grab repos from the first company's installation
  const [company] = await sql`SELECT * FROM companies ORDER BY created_at ASC LIMIT 1`
  if (!company) return c.json([])

  const repos = await sql`
    SELECT cr.repo_full_name
    FROM connected_repos cr
    JOIN github_installations gi ON gi.installation_id = cr.installation_id
    WHERE gi.company_id = ${company.id}
  `

  return c.json(repos.map((r: any) => ({
    name: r.repo_full_name.split('/').pop(),
    full: r.repo_full_name,
  })))
})

/** Public company profile */
app.get('/api/company/profile/:slug', async (c) => {
  const slug = c.req.param('slug')

  const companies_list = await sql`SELECT * FROM companies`
  const company = companies_list.find((co: any) => toSlug(co.org_name) === slug)

  if (!company) return c.json({ error: 'Company not found' }, 404)

  const initials = company.org_name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const repos = await sql`
    SELECT cr.repo_full_name, COUNT(ci.id) AS issue_count
    FROM connected_repos cr
    JOIN github_installations gi ON gi.installation_id = cr.installation_id
    LEFT JOIN configured_issues ci ON ci.repo_full_name = cr.repo_full_name AND ci.installation_id = cr.installation_id
    WHERE gi.company_id = ${company.id}
    GROUP BY cr.repo_full_name
  `

  const [stats] = await sql`
    SELECT
      COUNT(ci.id) AS total_issues,
      COUNT(ci.id) FILTER (WHERE NOT EXISTS (
        SELECT 1 FROM developer_issues di WHERE di.configured_issue_id = ci.id AND di.status = 'completed'
      )) AS open_issues,
      COUNT(DISTINCT di.developer_id) AS active_devs,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status = 'completed'), 0) AS total_paid
    FROM configured_issues ci
    JOIN connected_repos cr ON cr.repo_full_name = ci.repo_full_name AND cr.installation_id = ci.installation_id
    JOIN github_installations gi ON gi.installation_id = cr.installation_id
    LEFT JOIN developer_issues di ON di.configured_issue_id = ci.id
    WHERE gi.company_id = ${company.id}
  `

  // GitHub org name from installation
  const [installation] = await sql`
    SELECT account_login FROM github_installations WHERE company_id = ${company.id} LIMIT 1
  `

  // Recent issue activity
  const recentActivity = await sql`
    SELECT di.status, ci.title, ci.repo_full_name AS repo, ci.salary,
           COALESCE(di.completed_at, di.submitted_at, di.claimed_at) AS date,
           d.username AS developer_username
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    JOIN connected_repos cr ON cr.repo_full_name = ci.repo_full_name AND cr.installation_id = ci.installation_id
    JOIN github_installations gi ON gi.installation_id = cr.installation_id
    JOIN developers d ON d.id = di.developer_id
    WHERE gi.company_id = ${company.id}
    ORDER BY COALESCE(di.completed_at, di.submitted_at, di.claimed_at) DESC
    LIMIT 10
  `

  return c.json({
    name: company.org_name,
    slug,
    initials,
    plan: company.plan,
    email: company.email ?? null,
    githubOrg: installation?.account_login ?? null,
    memberSince: company.created_at,
    repos: repos.map((r: any) => ({
      name: r.repo_full_name.split('/').pop(),
      full: r.repo_full_name,
      issueCount: Number(r.issue_count),
    })),
    stats: {
      totalIssues: Number(stats.total_issues),
      openIssues: Number(stats.open_issues),
      activeDevs: Number(stats.active_devs),
      totalPaid: Number(stats.total_paid),
    },
    recentActivity: recentActivity.map((a: any) => ({
      type: a.status,
      issueTitle: a.title,
      repo: a.repo,
      salary: a.salary,
      date: a.date,
      developer: a.developer_username,
    })),
  })
})

// ─── Developer Profile API ────────────────────────────

function maskApiKey(key: string | null): string | null {
  if (!key) return null
  return key.length > 8 ? `${key.slice(0, 6)}...${key.slice(-4)}` : '••••'
}

function getInitials(firstName: string, lastName: string): string {
  const f = firstName?.trim()?.[0] ?? ''
  const l = lastName?.trim()?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

/** Owner profile — full data for the logged-in developer */
app.get('/api/developer/profile', async (c) => {
  const id = c.req.query('id')

  const [dev] = id
    ? await sql`SELECT * FROM developers WHERE id = ${id}`
    : await sql`SELECT * FROM developers ORDER BY created_at ASC LIMIT 1`

  if (!dev) {
    return c.json({
      username: '—', firstName: '—', lastName: '', initials: '?',
      email: '—', githubConnected: false, githubUsername: null,
      model: '—', apiKeyMasked: null, memberSince: '—',
      stats: { issuesCompleted: 0, totalEarned: 0, reposContributed: 0, activeStreak: 0 },
      recentActivity: [],
    })
  }

  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE di.status = 'completed') AS issues_completed,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status = 'completed'), 0) AS total_earned,
      COUNT(DISTINCT ci.repo_full_name) AS repos_contributed,
      0 AS active_streak
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${dev.id}
  `

  const activity = await sql`
    SELECT di.status AS type, ci.title AS issue_title, ci.repo_full_name AS repo,
           COALESCE(di.completed_at, di.submitted_at, di.claimed_at) AS date,
           ci.salary
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${dev.id}
    ORDER BY COALESCE(di.completed_at, di.submitted_at, di.claimed_at) DESC
    LIMIT 10
  `

  return c.json({
    username: dev.username ?? dev.email.split('@')[0],
    firstName: dev.first_name,
    lastName: dev.last_name,
    initials: getInitials(dev.first_name, dev.last_name),
    email: dev.email,
    githubConnected: !!dev.github_id,
    githubUsername: dev.username ?? null,
    model: dev.preferred_model,
    apiKeyMasked: maskApiKey(dev.anthropic_api_key),
    memberSince: dev.created_at,
    stats: {
      issuesCompleted: Number(stats.issues_completed),
      totalEarned: Number(stats.total_earned),
      reposContributed: Number(stats.repos_contributed),
      activeStreak: Number(stats.active_streak),
    },
    recentActivity: activity.map((a: any) => ({
      type: a.type,
      issueTitle: a.issue_title,
      repo: a.repo,
      date: a.date,
      salary: a.salary,
    })),
  })
})

/** Public profile — visible to anyone */
app.get('/api/developer/profile/:username', async (c) => {
  const username = c.req.param('username')

  const [dev] = await sql`SELECT * FROM developers WHERE username = ${username}`

  if (!dev) return c.json({ error: 'Developer not found' }, 404)

  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE di.status = 'completed') AS issues_completed,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status = 'completed'), 0) AS total_earned,
      COUNT(DISTINCT ci.repo_full_name) AS repos_contributed
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${dev.id}
  `

  const activity = await sql`
    SELECT di.status AS type, ci.title AS issue_title, ci.repo_full_name AS repo,
           COALESCE(di.completed_at, di.submitted_at, di.claimed_at) AS date,
           ci.salary
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${dev.id}
    ORDER BY COALESCE(di.completed_at, di.submitted_at, di.claimed_at) DESC
    LIMIT 5
  `

  return c.json({
    username: dev.username,
    initials: getInitials(dev.first_name, dev.last_name),
    memberSince: dev.created_at,
    stats: {
      issuesCompleted: Number(stats.issues_completed),
      totalEarned: Number(stats.total_earned),
      reposContributed: Number(stats.repos_contributed),
    },
    recentActivity: activity.map((a: any) => ({
      type: a.type,
      issueTitle: a.issue_title,
      repo: a.repo,
      date: a.date,
      salary: a.salary,
    })),
  })
})

// ─── Developer Issues API ─────────────────────────────

/** List issues for the logged-in developer */
app.get('/api/developer/issues', async (c) => {
  const devId = c.req.query('developer_id')

  const rows = await sql`
    SELECT di.id, di.status, di.claimed_at, di.submitted_at, di.completed_at,
           ci.issue_number, ci.title, ci.repo_full_name, ci.salary, ci.labels
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    ${devId ? sql`WHERE di.developer_id = ${devId}` : sql``}
    ORDER BY di.claimed_at DESC
  `

  const issues = rows.map((r: any) => ({
    id: String(r.issue_number),
    title: r.title,
    repo: r.repo_full_name,
    status: r.status,
    labels: r.labels ?? [],
    salary: r.salary,
    devs: 0,
    devInitials: [],
    devColors: [],
    comments: 0,
    updated: (r.completed_at ?? r.submitted_at ?? r.claimed_at)?.toISOString?.() ?? '',
  }))

  return c.json({ issues, total: issues.length })
})

/** Stats for the developer issues page */
app.get('/api/developer/issues/stats', async (c) => {
  const devId = c.req.query('developer_id')

  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE di.status = 'claimed') AS claimed_count,
      COUNT(*) FILTER (WHERE di.status IN ('claimed','submitted')) AS open_count,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status IN ('claimed','submitted')), 0) AS total_value,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status = 'completed'), 0) AS earned_total
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    ${devId ? sql`WHERE di.developer_id = ${devId}` : sql``}
  `

  return c.json({
    openCount: Number(stats.open_count),
    claimedCount: Number(stats.claimed_count),
    totalValue: Number(stats.total_value),
    earnedTotal: Number(stats.earned_total),
  })
})

/** Claim an issue */
app.post('/api/developer/issues/claim', async (c) => {
  const { developer_id, configured_issue_id } = await c.req.json<{
    developer_id: string
    configured_issue_id: number
  }>()

  const [row] = await sql`
    INSERT INTO developer_issues (developer_id, configured_issue_id, status)
    VALUES (${developer_id}, ${configured_issue_id}, 'claimed')
    ON CONFLICT (developer_id, configured_issue_id) DO NOTHING
    RETURNING *
  `

  return c.json({ claimed: row ?? null })
})

/** Submit work on an issue */
app.post('/api/developer/issues/submit', async (c) => {
  const { developer_id, configured_issue_id } = await c.req.json<{
    developer_id: string
    configured_issue_id: number
  }>()

  const [row] = await sql`
    UPDATE developer_issues
    SET status = 'submitted', submitted_at = NOW()
    WHERE developer_id = ${developer_id} AND configured_issue_id = ${configured_issue_id}
    RETURNING *
  `

  return c.json({ submitted: row ?? null })
})

// ─── Developer Earnings API ──────────────────────────

/** Earnings summary for the logged-in developer */
app.get('/api/developer/earnings', async (c) => {
  const devId = c.req.query('developer_id')
  if (!devId) return c.json({ error: 'developer_id required' }, 400)

  const [totals] = await sql`
    SELECT
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status = 'completed'), 0) AS total_earned,
      COALESCE(SUM(ci.salary) FILTER (WHERE di.status IN ('claimed','submitted')), 0) AS pending,
      COUNT(*) FILTER (WHERE di.status = 'completed') AS completed_count
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${devId}
  `

  const history = await sql`
    SELECT ci.title, ci.repo_full_name AS repo, ci.salary, di.completed_at
    FROM developer_issues di
    JOIN configured_issues ci ON ci.id = di.configured_issue_id
    WHERE di.developer_id = ${devId} AND di.status = 'completed'
    ORDER BY di.completed_at DESC
  `

  return c.json({
    totalEarned: Number(totals.total_earned),
    pending: Number(totals.pending),
    completedCount: Number(totals.completed_count),
    history: history.map((h: any) => ({
      title: h.title,
      repo: h.repo,
      salary: h.salary,
      completedAt: h.completed_at,
    })),
  })
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

    // Promote to issues table — this is the source of truth for the company dashboard
    await sql`
      INSERT INTO issues (installation_id, repo_full_name, issue_number, title, salary, labels)
      VALUES (${installation_id}, ${issue.repo_full_name}, ${issue.issue_number}, ${issue.title}, ${issue.salary}, ${issue.labels})
      ON CONFLICT (installation_id, repo_full_name, issue_number) DO UPDATE SET
        title  = EXCLUDED.title,
        salary = EXCLUDED.salary,
        labels = EXCLUDED.labels,
        updated_at = NOW()
    `
  }

  return c.json({ ok: true, count: issues.length })
})

// ─── Company Dashboard API ────────────────────────────────

/** Stats must be registered before the issues list to avoid route shadowing */
app.get('/api/company/issues/stats', async (c) => {
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'open')                    AS "openCount",
      COUNT(*) FILTER (WHERE status IN ('claimed', 'in_review')) AS "inProgressCount",
      COALESCE(SUM(salary) FILTER (WHERE status = 'open'), 0)   AS "totalValue",
      COUNT(*)                                                   AS "total"
    FROM issues
  `
  return c.json({
    openCount:       Number(row.openCount),
    inProgressCount: Number(row.inProgressCount),
    activeDevs:      0,
    totalValue:      Number(row.totalValue),
    total:           Number(row.total),
  })
})

/** Promoted issues — what the company dashboard table shows */
app.get('/api/company/issues', async (c) => {
  const rows = await sql`SELECT * FROM issues ORDER BY created_at DESC`
  const issues = rows.map((r) => ({
    id:          `#${r.issue_number}`,
    title:       r.title,
    repo:        (r.repo_full_name as string).split('/')[1] ?? r.repo_full_name,
    status:      r.status,
    label:       ((r.labels as string[])[0]) ?? '',
    salary:      String(r.salary),
    devs:        0,
    devInitials: [] as string[],
    devColors:   [] as string[],
    updated:     new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))
  return c.json({ issues, total: issues.length })
})

/** Repos for the filter dropdown */
app.get('/api/company/repos', async (c) => {
  const rows = await sql`SELECT DISTINCT repo_full_name FROM connected_repos`
  return c.json(rows.map((r) => ({
    name: (r.repo_full_name as string).split('/')[1] ?? r.repo_full_name,
    full: r.repo_full_name,
  })))
})

/** Company profile for the topbar */
app.get('/api/company/profile', async (c) => {
  const [company] = await sql`SELECT org_name, plan FROM companies LIMIT 1`
  if (company) {
    return c.json({
      name:     company.org_name,
      initials: (company.org_name as string).slice(0, 2).toUpperCase(),
      plan:     company.plan,
    })
  }
  const [inst] = await sql`SELECT account_login FROM github_installations LIMIT 1`
  if (inst) {
    return c.json({
      name:     inst.account_login,
      initials: (inst.account_login as string).slice(0, 2).toUpperCase(),
      plan:     'Free',
    })
  }
  return c.json({ name: '—', initials: '?', plan: '—' })
})

export const handler = handle(app)
export default app
