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

// ─── Git operations for the editor ────────────────────────────

/** Get the default branch name for a repo */
export async function getRepoDefaultBranch(installationId: number, repoFullName: string): Promise<string> {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub repo API failed (${res.status}): ${body}`)
  }
  const data = await res.json() as { default_branch: string }
  return data.default_branch
}

/** Get the full recursive tree of a repo at a given branch */
export async function getRepoTree(installationId: number, repoFullName: string, branch: string) {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/git/trees/${branch}?recursive=1`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub tree API failed (${res.status}): ${body}`)
  }
  const data = await res.json() as {
    tree: Array<{ path: string; type: 'blob' | 'tree'; sha: string; size?: number }>
  }
  return data.tree ?? []
}

/** Get a single file's content and blob SHA */
export async function getFileContent(installationId: number, repoFullName: string, path: string, ref: string): Promise<{ content: string; sha: string }> {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${path}?ref=${ref}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub contents API failed (${res.status}): ${body}`)
  }
  const data = await res.json() as { content: string; sha: string }
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content, sha: data.sha }
}

/** Get the SHA of a branch's HEAD */
export async function getBranchSha(installationId: number, repoFullName: string, branch: string): Promise<string> {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/git/ref/heads/${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  const data = await res.json() as { object: { sha: string } }
  return data.object.sha
}

/** Create a new branch from a given SHA */
export async function createBranch(installationId: number, repoFullName: string, branchName: string, fromSha: string): Promise<void> {
  const token = await getInstallationToken(installationId)
  await fetch(`${GITHUB_API}/repos/${repoFullName}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: fromSha }),
  })
}

/** Commit (create or update) a single file on a branch */
export async function commitFile(
  installationId: number, repoFullName: string,
  path: string, content: string, sha: string | undefined,
  branch: string, message: string,
): Promise<{ sha: string }> {
  const token = await getInstallationToken(installationId)
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json() as { content: { sha: string } }
  return { sha: data.content.sha }
}

/** Create a pull request */
export async function createPullRequest(
  installationId: number, repoFullName: string,
  head: string, base: string, title: string, body: string,
): Promise<{ number: number; html_url: string }> {
  const token = await getInstallationToken(installationId)
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, head, base }),
  })
  const data = await res.json() as { number: number; html_url: string }
  return data
}
