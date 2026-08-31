import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession, Session } from './session'
import { MISSING_ENV } from './db'

export type Role = 'runner' | 'supervisor' | 'admin'
const RANK: Record<Role, number> = { runner: 1, supervisor: 2, admin: 3 }

/**
 * Devuelve la sesión o responde 401/403 y devuelve null.
 * minRole es el nivel mínimo requerido para la ruta.
 */
export function requireAuth(req: NextApiRequest, res: NextApiResponse, minRole: Role = 'runner'): Session | null {
  if (MISSING_ENV) { res.status(500).json({ error: MISSING_ENV }); return null }
  const s = getSession(req)
  if (!s) { res.status(401).json({ error: 'No autenticado' }); return null }
  if (RANK[s.role] < RANK[minRole]) { res.status(403).json({ error: 'No tienes permiso para esto' }); return null }
  return s
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed)
  res.status(405).json({ error: 'Método no permitido' })
}
