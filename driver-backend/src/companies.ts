import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { sql } from './db.js'
import { signToken } from './jwt.js'
import type { AppEnv } from './middleware.js'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  const hashBuf = Buffer.from(hash, 'hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuf, derived)
}

const TOKEN_COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  sameSite: 'Lax' as const,
  maxAge: 60 * 60 * 24 * 90,
}

const companies = new Hono<AppEnv>()

/** Email/password sign-up (alternative to GitHub App installation flow) */
companies.post('/signup', async (c) => {
  const { orgName, email, password } = await c.req.json<{
    orgName: string
    email: string
    password: string
  }>()

  const passwordHash = await hashPassword(password)

  const [company] = await sql`
    INSERT INTO companies (org_name, email, password_hash)
    VALUES (${orgName}, ${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `

  if (!company) return c.json({ message: 'Email already registered.' }, 409)

  setCookie(c, 'token', signToken({ sub: company.id, role: 'company' }), TOKEN_COOKIE_OPTS)
  return c.json({ ok: true }, 201)
})

/** Email/password sign-in */
companies.post('/signin', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  const [company] = await sql`SELECT * FROM companies WHERE email = ${email}`
  if (!company) return c.json({ message: 'Invalid credentials.' }, 401)

  if (!company.password_hash) {
    return c.json({ message: 'This account uses GitHub sign-in.' }, 400)
  }

  const valid = await verifyPassword(password, company.password_hash)
  if (!valid) return c.json({ message: 'Invalid credentials.' }, 401)

  setCookie(c, 'token', signToken({ sub: company.id, role: 'company' }), TOKEN_COOKIE_OPTS)
  return c.json({ ok: true })
})

/** Clear the auth cookie */
companies.post('/signout', (c) => {
  deleteCookie(c, 'token', { path: '/' })
  return c.json({ ok: true })
})

export default companies
