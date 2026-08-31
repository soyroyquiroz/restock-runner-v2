import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

const SECRET = process.env.SESSION_SECRET as string
const COOKIE = 'rr_session'
const MAX_AGE = 60 * 60 * 24 * 14 // 14 días

export interface Session {
  id: string
  name: string
  role: 'runner' | 'supervisor' | 'admin'
  exp: number
}

function b64url(buf: Buffer | string) {
  return Buffer.from(buf).toString('base64url')
}

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function makeToken(s: Omit<Session, 'exp'>): string {
  const body = b64url(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + MAX_AGE }))
  return `${body}.${sign(body)}`
}

export function readToken(token: string | undefined): Session | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = sign(body)
  // comparación en tiempo constante
  if (sig.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session
    if (!s.exp || s.exp < Math.floor(Date.now() / 1000)) return null
    return s
  } catch { return null }
}

export function setSessionCookie(res: NextApiResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=${MAX_AGE}`)
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
}

export function getSession(req: NextApiRequest): Session | null {
  return readToken(req.cookies?.[COOKIE])
}
