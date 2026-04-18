import { Hono } from 'hono'
import { deleteCookie } from 'hono/cookie'
import { sql } from './db.js'
import { requireDeveloper, type AppEnv } from './middleware.js'

const developers = new Hono<AppEnv>()

developers.patch('/:id/api-key', requireDeveloper, async (c) => {
  const id = c.req.param('id')

  if (c.get('user').sub !== id) return c.json({ message: 'Forbidden' }, 403)

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

developers.post('/signout', (c) => {
  deleteCookie(c, 'token', { path: '/' })
  return c.json({ ok: true })
})

export default developers
