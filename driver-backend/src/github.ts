import jwt from 'jsonwebtoken'

const GITHUB_API = 'https://api.github.com'

/** Create a JWT signed with the GitHub App's private key */
export function createAppJwt(): string {
  const appId = process.env.GITHUB_APP_ID!
  const privateKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    { iat: now - 60, exp: now + 600, iss: appId },
    privateKey,
    { algorithm: 'RS256' },
  )
}

/** Exchange an OAuth code for a user access token */
export async function exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  return res.json() as Promise<{ access_token: string }>
}

/** Get the authenticated user */
export async function getUser(token: string) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  return res.json()
}

/** Get the primary verified email for the authenticated user */
export async function getUserPrimaryEmail(token: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/user/emails`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  const data = await res.json()
  if (!Array.isArray(data)) return null
  const emails = data as Array<{ email: string; primary: boolean; verified: boolean }>
  const primary = emails.find(e => e.primary && e.verified)
  return primary?.email ?? emails[0]?.email ?? null
}

/** List installations accessible to the authenticated user */
export async function getUserInstallations(token: string) {
  const res = await fetch(`${GITHUB_API}/user/installations`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  return res.json()
}

/** Get an installation access token (app-level, not user-level) */
export async function getInstallationToken(installationId: number): Promise<string> {
  const appJwt = createAppJwt()
  const res = await fetch(`${GITHUB_API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${appJwt}`, Accept: 'application/vnd.github+json' },
  })
  const data = await res.json() as { token: string }
  return data.token
}

/** List repos accessible to an installation */
export async function getInstallationRepos(installationId: number) {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/installation/repositories?per_page=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  return res.json()
}

/** List open issues for a repo via an installation token */
export async function getRepoIssues(installationId: number, repoFullName: string) {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/issues?state=open&per_page=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  return res.json()
}
