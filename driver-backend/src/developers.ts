import { Hono } from 'hono'
import { sql } from './db.js'

const developers = new Hono()

// ─── Routes ───────────────────────────────────────────────

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
