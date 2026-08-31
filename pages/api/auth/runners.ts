import type { NextApiRequest, NextApiResponse } from 'next'
import { db, MISSING_ENV } from '@/lib/server/db'

// Lista pública mínima para la pantalla de login: solo id y nombre.
// No expone rol ni nada más hasta que la persona se autentica.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (MISSING_ENV) return res.status(500).json({ error: MISSING_ENV })
  const { data, error } = await db.from('runners').select('id,name').eq('active', true).order('name')
  if (error) return res.status(500).json({ error: 'No se pudo cargar la lista' })
  res.json({ runners: data ?? [] })
}
