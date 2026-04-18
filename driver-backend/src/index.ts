import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/test', async (c) => {
  const { word } = await c.req.json<{ word: string }>()

  await sql`
    CREATE TABLE IF NOT EXISTS test (
      id SERIAL PRIMARY KEY,
      word TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  const [row] = await sql`
    INSERT INTO test (word) VALUES (${word}) RETURNING *
  `

  return c.json(row)
})

export const handler = handle(app)
export default app
