import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/server/session'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = getSession(req)
  if (!s) return res.status(401).json({ error: 'No autenticado' })
  res.json({ runner: { id: s.id, name: s.name, role: s.role } })
}
