import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'
import { ITEM_BY_ID, getStandard, missingPcs, Entity } from '@/lib/data'

// Guarda una ronda de inventario de un espacio.
// El servidor RECALCULA los faltantes desde el catálogo: el cliente solo
// manda las unidades observadas, nunca las cantidades a surtir.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  const s = requireAuth(req, res)
  if (!s) return

  const { entity, lodge, bridge, piso, type, present } = req.body ?? {}
  if (!['outside', 'main'].includes(entity)) return res.status(400).json({ error: 'Entidad inválida' })
  if (!['profundidad', 'urgente'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })
  if (entity === 'outside' && (!lodge || !bridge)) return res.status(400).json({ error: 'Falta lodge o bridge' })
  if (entity === 'main' && !piso) return res.status(400).json({ error: 'Falta el piso' })

  const space_key = entity === 'outside' ? `o-${lodge}-${bridge}` : `m-${piso}`

  const rows = Object.entries(present ?? {}).map(([id, steps]) => {
    const item = ITEM_BY_ID[Number(id)]
    if (!item) return null
    const std = getStandard(item, entity as Entity, piso ?? null)
    if (!std) return null
    const observed = Math.max(0, Math.min(std.steps, Number(steps)))
    return {
      item_id: item.id,
      item_name: item.es,
      steps_present: observed,
      steps_standard: std.steps,
      missing_pcs: missingPcs(item, entity as Entity, piso ?? null, observed),
    }
  }).filter(Boolean) as any[]

  if (rows.length === 0) return res.status(400).json({ error: 'No hay items que guardar' })

  const { data: report, error: e1 } = await db.from('reports').insert({
    runner_id: s.id, runner_name: s.name, entity,
    lodge_num: entity === 'outside' ? lodge : null,
    bridge_num: entity === 'outside' ? bridge : null,
    space_name: entity === 'main' ? piso : null,
    restock_type: type,
  }).select('id').single()
  if (e1 || !report) return res.status(500).json({ error: e1?.message ?? 'No se pudo guardar' })

  const { error: e2 } = await db.from('report_items').insert(rows.map(r => ({ ...r, report_id: report.id })))
  if (e2) return res.status(500).json({ error: e2.message })

  const { error: e3 } = await db.from('space_status').upsert(rows.map(r => ({
    space_key, entity,
    lodge_num: entity === 'outside' ? lodge : null,
    bridge_num: entity === 'outside' ? bridge : null,
    space_name: entity === 'main' ? piso : null,
    updated_by: s.name, updated_at: new Date().toISOString(), ...r,
  })), { onConflict: 'space_key,item_id' })
  if (e3) return res.status(500).json({ error: e3.message })

  res.json({ ok: true })
}
