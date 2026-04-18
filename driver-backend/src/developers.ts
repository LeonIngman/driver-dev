import { Hono } from 'hono'
import crypto from 'node:crypto'
import { sql } from './db.js'

const developers = new Hono()

// ─── Helpers ──────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// ─── Routes ───────────────────────────────────────────────

developers.post('/signup', async (c) => {
  const { firstName, lastName, email, password, anthropicApiKey } =
    await c.req.json<{
      firstName: string
      lastName: string
      email: string
      password: string
      anthropicApiKey: string
    }>()

  const [existing] = await sql`SELECT id FROM developers WHERE email = ${email}`
  if (existing) return c.json({ message: 'An account with this email already exists.' }, 409)

  const passwordHash = hashPassword(password)

  await sql`
    INSERT INTO developers (first_name, last_name, email, password_hash, anthropic_api_key)
    VALUES (${firstName}, ${lastName}, ${email}, ${passwordHash}, ${anthropicApiKey})
  `

  return c.json({ ok: true }, 201)
})

developers.patch('/:id/api-key', async (c) => {
  const id = c.req.param('id')
  const { anthropicApiKey } = await c.req.json<{ anthropicApiKey: string }>()

  const [row] = await sql`
    UPDATE developers SET anthropic_api_key = ${anthropicApiKey}
    WHERE id = ${id}
    RETURNING id
  `

  if (!row) return c.json({ message: 'Developer not found.' }, 404)
  return c.json({ ok: true })
})

developers.get('/leaderboard/week', async (_c) => {
  // TODO: query top earner for current ISO week
  return _c.json(null, 200)
})

export default developers
