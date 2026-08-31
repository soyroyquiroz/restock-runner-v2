import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])
  const s = requireAuth(req, res, 'admin')
  if (!s) return

  const id = String(req.query.id)
  const { active, role, resetPin } = req.body ?? {}

  if (id === s.id && active === false) {
    return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' })
  }

  if (typeof active === 'boolean' || role) {
    if (role && !['runner', 'supervisor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' })
    }
    // Nunca dejar el sistema sin ningún admin activo
    if (id === s.id && role && role !== 'admin') {
      return res.status(400).json({ error: 'No puedes quitarte a ti mismo el rol de admin' })
    }
    const patch: Record<string, unknown> = {}
    if (typeof active === 'boolean') patch.active = active
    if (role) patch.role = role
    const { error } = await db.from('runners').update(patch).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
  }

  if (resetPin) {
    if (!/^\d{4}$/.test(resetPin)) return res.status(400).json({ error: 'El PIN debe ser de 4 dígitos' })
    const { error } = await db.rpc('set_runner_pin', { p_id: id, p_pin: resetPin })
    if (error) return res.status(500).json({ error: error.message })
  }

  res.json({ ok: true })
}
