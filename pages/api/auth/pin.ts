import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'

// Cada quien cambia su propio PIN. Requiere el actual.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const s = requireAuth(req, res)
  if (!s) return

  const { current, next } = req.body ?? {}
  if (!/^\d{4}$/.test(next ?? '')) return res.status(400).json({ error: 'El PIN nuevo debe ser de 4 dígitos' })
  if (next === current) return res.status(400).json({ error: 'El PIN nuevo es igual al actual' })

  const { data } = await db.rpc('login_runner', { p_id: s.id, p_pin: current })
  if (!(Array.isArray(data) ? data[0] : data)) return res.status(401).json({ error: 'Tu PIN actual no coincide' })

  const { error } = await db.rpc('set_runner_pin', { p_id: s.id, p_pin: next })
  if (error) return res.status(500).json({ error: 'No se pudo cambiar el PIN' })
  res.json({ ok: true })
}
