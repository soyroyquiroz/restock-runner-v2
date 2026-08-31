import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/guard'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = requireAuth(req, res)
  if (!s) return

  const since = new Date(); since.setHours(0, 0, 0, 0)

  // Un runner ve su propia actividad; supervisor y admin ven la isla completa.
  let q = db.from('reports').select('*').gte('created_at', since.toISOString()).order('created_at', { ascending: false })
  if (s.role === 'runner') q = q.eq('runner_id', s.id)

  const [a, b] = await Promise.all([q, db.from('space_status').select('*').order('updated_at', { ascending: false })])
  if (a.error || b.error) return res.status(500).json({ error: a.error?.message ?? b.error?.message })

  res.json({ reports: a.data ?? [], status: b.data ?? [], scope: s.role === 'runner' ? 'propio' : 'isla' })
}
