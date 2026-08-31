import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ver la plantilla: supervisor o admin. Crear: solo admin.
  if (req.method === 'GET') {
    const s = requireAuth(req, res, 'supervisor')
    if (!s) return
    const { data, error } = await db.from('runners').select('id,name,role,active').order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ runners: data ?? [] })
  }

  if (req.method === 'POST') {
    const s = requireAuth(req, res, 'admin')
    if (!s) return
    const { name, pin, role } = req.body ?? {}
    if (!name?.trim()) return res.status(400).json({ error: 'Falta el nombre' })
    if (!/^\d{4}$/.test(pin ?? '')) return res.status(400).json({ error: 'El PIN debe ser de 4 dígitos' })
    if (!['runner', 'supervisor', 'admin'].includes(role)) return res.status(400).json({ error: 'Rol inválido' })

    const { error } = await db.rpc('create_runner', { p_name: name.trim(), p_pin: pin, p_role: role })
    if (error) {
      const dup = error.message.includes('duplicate') || error.message.includes('unique')
      return res.status(dup ? 409 : 500).json({ error: dup ? 'Ya existe un runner con ese nombre' : error.message })
    }
    return res.json({ ok: true })
  }

  methodNotAllowed(res, ['GET', 'POST'])
}
