import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/server/db'
import { requireAuth, methodNotAllowed } from '@/lib/server/guard'

// Un runner solo toca sus propios viajes. Supervisor y admin pueden
// intervenir cualquiera (cerrar un viaje que alguien dejó a medias).
async function loadTrip(id: string) {
  const { data } = await db.from('trips').select('*').eq('id', id).maybeSingle()
  return data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = requireAuth(req, res)
  if (!s) return
  const id = String(req.query.id)

  const trip = await loadTrip(id)
  if (!trip) return res.status(404).json({ error: 'Viaje no encontrado' })
  const owns = trip.runner_id === s.id
  if (!owns && s.role === 'runner') return res.status(403).json({ error: 'Ese viaje no es tuyo' })

  if (req.method === 'GET') {
    const [stops, items, load] = await Promise.all([
      db.from('trip_stops').select('*').eq('trip_id', id).order('sort_order'),
      db.from('trip_stop_items').select('*').eq('trip_id', id),
      db.from('trip_load_items').select('*').eq('trip_id', id).order('item_name'),
    ])
    return res.json({ trip, stops: stops.data ?? [], items: items.data ?? [], load: load.data ?? [] })
  }

  if (req.method !== 'POST') return methodNotAllowed(res, ['GET', 'POST'])

  const { action, itemId, stopId, value } = req.body ?? {}

  switch (action) {
    case 'toggleLoad': {
      const { error } = await db.from('trip_load_items').update({ loaded: !!value }).eq('id', itemId).eq('trip_id', id)
      return error ? res.status(500).json({ error: error.message }) : res.json({ ok: true })
    }

    case 'toggleDeliver': {
      const { error } = await db.from('trip_stop_items').update({ delivered: !!value }).eq('id', itemId).eq('trip_id', id)
      return error ? res.status(500).json({ error: error.message }) : res.json({ ok: true })
    }

    case 'startRoute': {
      const { error } = await db.from('trips').update({ status: 'entregando' }).eq('id', id)
      return error ? res.status(500).json({ error: error.message }) : res.json({ ok: true })
    }

    case 'finishStop': {
      const { data: stop } = await db.from('trip_stops').select('*').eq('id', stopId).eq('trip_id', id).maybeSingle()
      if (!stop) return res.status(404).json({ error: 'Parada no encontrada' })

      const { data: delivered } = await db.from('trip_stop_items')
        .select('*').eq('stop_id', stopId).eq('delivered', true)

      // Lo entregado deja ese item en su estándar
      for (const it of delivered ?? []) {
        await db.from('space_status').update({
          steps_present: it.steps_standard, missing_pcs: 0,
          updated_by: s.name, updated_at: new Date().toISOString(),
        }).eq('space_key', stop.space_key).eq('item_id', it.item_id)
      }

      await db.from('trip_stops').update({ delivered_at: new Date().toISOString() }).eq('id', stopId)

      const { data: pend } = await db.from('trip_stops').select('id').eq('trip_id', id).is('delivered_at', null)
      if (!pend?.length) {
        await db.from('trips').update({ status: 'completo', closed_at: new Date().toISOString() }).eq('id', id)
        return res.json({ ok: true, tripClosed: true })
      }
      return res.json({ ok: true, tripClosed: false })
    }

    case 'close': {
      const { error } = await db.from('trips')
        .update({ status: 'completo', closed_at: new Date().toISOString() }).eq('id', id)
      return error ? res.status(500).json({ error: error.message }) : res.json({ ok: true })
    }

    case 'cancel': {
      if (trip.status !== 'cargando') return res.status(400).json({ error: 'Ya salió a ruta; usa cerrar' })
      const { error } = await db.from('trips').delete().eq('id', id)
      return error ? res.status(500).json({ error: error.message }) : res.json({ ok: true })
    }

    default:
      return res.status(400).json({ error: 'Acción desconocida' })
  }
}
