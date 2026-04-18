import { Hono } from 'hono'
import crypto from 'node:crypto'
import { sql } from './db.js'

const companies = new Hono()

// ─── Helpers ──────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// ─── Routes ───────────────────────────────────────────────

companies.post('/signup', async (c) => {
  console.log('[companies] POST /signup hit')
  const { orgName, email, password } = await c.req.json<{
    orgName: string
    email: string
    password: string
  }>()

  const [existing] = await sql`SELECT id FROM companies WHERE email = ${email}`
  if (existing) return c.json({ message: 'An account with this email already exists.' }, 409)

  const passwordHash = hashPassword(password)

  const [row] = await sql`
    INSERT INTO companies (org_name, email, password_hash)
    VALUES (${orgName}, ${email}, ${passwordHash})
    RETURNING id
  `

  console.log(`[companies] signup persisted: id=${row.id} email=${email} org=${orgName}`)
  return c.json({ ok: true, companyId: row.id }, 201)
})

companies.post('/signin', async (c) => {
  const { email } = await c.req.json<{ email: string }>()

  const [company] = await sql`SELECT id FROM companies WHERE email = ${email}`
  if (!company) return c.json({ message: 'No account found with this email.' }, 404)

  // TODO: verify password and check real repo count once github_installations.company_id is linked
  return c.json({ companyId: company.id, hasRepos: false })
})

export default companies
