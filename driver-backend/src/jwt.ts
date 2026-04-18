import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export type TokenPayload = {
  sub: string
  role: 'developer' | 'company'
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '90d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}
