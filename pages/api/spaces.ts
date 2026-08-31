import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/guard'

// Espacios con faltante, para armar un viaje.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = requireAuth(req, res)
  if (!s) return
  const { data, error } = await db.from('space_status').select('*').gt('missing_pcs', 0)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ spaces: data ?? [] })
}
