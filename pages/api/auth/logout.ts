import type { NextApiRequest, NextApiResponse } from 'next'
import { clearSessionCookie } from '@/lib/server/session'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  clearSessionCookie(res)
  res.json({ ok: true })
}
