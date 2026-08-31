import type { NextApiRequest, NextApiResponse } from 'next'
import { db, MISSING_ENV } from '@/lib/server/db'
import { makeToken, setSessionCookie } from '@/lib/server/session'
import { methodNotAllowed } from '@/lib/server/guard'

// Límite de intentos por runner, en memoria del proceso.
const attempts = new Map<string, { n: number; until: number }>()
const MAX = 5
const LOCK_MS = 5 * 60 * 1000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (MISSING_ENV) return res.status(500).json({ error: MISSING_ENV })
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const { id, pin } = req.body ?? {}
  if (typeof id !== 'string' || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const rec = attempts.get(id)
  if (rec && rec.until > Date.now()) {
    const mins = Math.ceil((rec.until - Date.now()) / 60000)
    return res.status(429).json({ error: `Demasiados intentos. Espera ${mins} min.` })
  }

  const { data, error } = await db.rpc('login_runner', { p_id: id, p_pin: pin })
  if (error) return res.status(500).json({ error: 'Error de conexión' })

  const runner = Array.isArray(data) ? data[0] : data
  if (!runner) {
    const n = (rec?.n ?? 0) + 1
    attempts.set(id, { n, until: n >= MAX ? Date.now() + LOCK_MS : 0 })
    return res.status(401).json({ error: 'PIN incorrecto' })
  }

  attempts.delete(id)
  const session = { id: runner.id, name: runner.name, role: runner.role }
  setSessionCookie(res, makeToken(session))
  res.json({ runner: session })
}
