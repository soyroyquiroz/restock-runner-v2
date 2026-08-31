import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'
import { ITEM_BY_ID, pcsToBoxes } from '@/lib/data'
import { routeSort } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = requireAuth(req, res)
  if (!s) return

  // Viaje activo propio + (para supervisión) los viajes abiertos de los demás
  if (req.method === 'GET') {
    const mine = await db.from('trips').select('*').eq('runner_id', s.id).neq('status', 'completo')
      .order('created_at', { ascending: false }).limit(1)

    let others: any[] = []
    if (s.role !== 'runner') {
      const r = await db.from('trips').select('*').neq('runner_id', s.id).neq('status', 'completo')
        .order('created_at', { ascending: false })
      others = r.data ?? []
    }
    return res.json({ trip: mine.data?.[0] ?? null, others })
  }

  if (req.method === 'POST') {
    const keys: string[] = req.body?.spaceKeys ?? []
    if (!Array.isArray(keys) || keys.length === 0) return res.status(400).json({ error: 'No elegiste ningún espacio' })

    const open = await db.from('trips').select('id').eq('runner_id', s.id).neq('status', 'completo').limit(1)
    if (open.data?.length) return res.status(409).json({ error: 'Ya tienes un viaje abierto' })

    const { data: rows, error } = await db.from('space_status').select('*').in('space_key', keys).gt('missing_pcs', 0)
    if (error) return res.status(500).json({ error: error.message })
    if (!rows?.length) return res.status(400).json({ error: 'Esos espacios ya no tienen faltantes' })

    const groups = Object.values(rows.reduce((acc: Record<string, any[]>, r: any) => {
      (acc[r.space_key] ||= []).push(r); return acc
    }, {})).sort((a: any, b: any) => routeSort(a[0], b[0]))

    const { data: trip, error: e1 } = await db.from('trips')
      .insert({ runner_id: s.id, runner_name: s.name, status: 'cargando' }).select('id').single()
    if (e1 || !trip) return res.status(500).json({ error: e1?.message ?? 'No se pudo crear el viaje' })

    const { data: stops, error: e2 } = await db.from('trip_stops').insert(
      groups.map((g: any, i: number) => ({
        trip_id: trip.id, space_key: g[0].space_key, entity: g[0].entity,
        lodge_num: g[0].lodge_num, bridge_num: g[0].bridge_num, space_name: g[0].space_name, sort_order: i,
      }))
    ).select('id,space_key')
    if (e2 || !stops) return res.status(500).json({ error: e2?.message ?? 'Error en paradas' })

    const stopId: Record<string, string> = Object.fromEntries(stops.map((x: any) => [x.space_key, x.id]))
    const stopItems = groups.flatMap((g: any) => g.map((r: any) => ({
      stop_id: stopId[r.space_key], trip_id: trip.id, item_id: r.item_id, item_name: r.item_name,
      units: Number(r.steps_standard) - Number(r.steps_present),
      steps_standard: Number(r.steps_standard), pcs: r.missing_pcs, delivered: false,
    })))
    const { error: e3 } = await db.from('trip_stop_items').insert(stopItems)
    if (e3) return res.status(500).json({ error: e3.message })

    const agg: Record<number, { name: string; pcs: number }> = {}
    stopItems.forEach((si: any) => {
      agg[si.item_id] ||= { name: si.item_name, pcs: 0 }
      agg[si.item_id].pcs += si.pcs
    })
    const loadItems = Object.entries(agg).map(([id, v]) => {
      const item = ITEM_BY_ID[Number(id)]
      const { boxes, remainderPcs } = item ? pcsToBoxes(item, v.pcs) : { boxes: 0, remainderPcs: v.pcs }
      return { trip_id: trip.id, item_id: Number(id), item_name: v.name, total_pcs: v.pcs, boxes, remainder_pcs: remainderPcs, loaded: false }
    })
    const { error: e4 } = await db.from('trip_load_items').insert(loadItems)
    if (e4) return res.status(500).json({ error: e4.message })

    return res.json({ tripId: trip.id })
  }

  methodNotAllowed(res, ['GET', 'POST'])
}
