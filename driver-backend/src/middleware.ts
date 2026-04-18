import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { verifyToken, type TokenPayload } from './jwt.js'

export type AppEnv = {
  Variables: { user: TokenPayload }
}

function extractToken(authHeader: string | undefined, cookieToken: string | undefined): string | null {
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return cookieToken ?? null
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = extractToken(c.req.header('Authorization'), getCookie(c, 'token'))
  if (!token) return c.json({ message: 'Unauthorized' }, 401)
  try {
    c.set('user', verifyToken(token))
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})

export const requireDeveloper = createMiddleware<AppEnv>(async (c, next) => {
  const token = extractToken(c.req.header('Authorization'), getCookie(c, 'token'))
  if (!token) return c.json({ message: 'Unauthorized' }, 401)
  try {
    const payload = verifyToken(token)
    if (payload.role !== 'developer') return c.json({ message: 'Forbidden' }, 403)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})

export const requireCompany = createMiddleware<AppEnv>(async (c, next) => {
  const token = extractToken(c.req.header('Authorization'), getCookie(c, 'token'))
  if (!token) return c.json({ message: 'Unauthorized' }, 401)
  try {
    const payload = verifyToken(token)
    if (payload.role !== 'company') return c.json({ message: 'Forbidden' }, 403)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ message: 'Invalid or expired token' }, 401)
  }
})
