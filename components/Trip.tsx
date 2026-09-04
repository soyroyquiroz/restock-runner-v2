import { useState, useEffect, useCallback } from 'react'
import { ITEM_BY_ID, fmt, allocateAcrossStops, StopNeed } from '@/lib/data'
import {
  supabase, Runner, SpaceStatusRow, Trip, TripStop, TripStopItem, TripLoadItem,
  spaceLabel, routeSort,
} from '@/lib/supabase'
import { C, card, row, btn, btnGhost, sectionLabel, Section, Check } from '@/lib/ui'

export default function TripSection({ runner }: { runner: Runner }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTrip = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*')
      .eq('runner_id', runner.id).neq('status', 'completo')
      .order('created_at', { ascending: false }).limit(1)
    setTrip((data?.[0] as Trip) ?? null)
    setLoading(false)
  }, [runner.id])

  useEffect(() => { loadTrip() }, [loadTrip])

  if (loading) return <p style={{ color: C.gray }}>Cargando…</p>
  if (!trip) return <BuildTrip runner={runner} onCreated={loadTrip} />
  if (trip.status === 'cargando') return <LoadCart trip={trip} onReady={loadTrip} onCancel={loadTrip} />
  return <Route trip={trip} onDone={loadTrip} />
}

// ---------- PASO 1: elegir bridges del viaje ----------
function BuildTrip({ runner, onCreated }: { runner: Runner; onCreated: () => void }) {
  const [rows, setRows] = useState<SpaceStatusRow[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('space_status').select('*').gt('missing_pcs', 0)
      .then(({ data }) => setRows((data ?? []) as SpaceStatusRow[]))
  }, [])

  const spaces = Object.values(
    rows.reduce((acc: Record<string, SpaceStatusRow[]>, r) => { (acc[r.space_key] ||= []).push(r); return acc }, {})
  ).sort((a, b) => routeSort(a[0], b[0]))

  function toggle(key: string) {
    setPicked(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  async function create() {
    if (picked.size === 0 || busy) return
    setBusy(true); setMsg('')

    const chosen = spaces.filter(g => picked.has(g[0].space_key)).sort((a, b) => routeSort(a[0], b[0]))

    const { data: trip, error: e1 } = await supabase.from('trips')
      .insert({ runner_id: runner.id, runner_name: runner.name, status: 'cargando' })
      .select('id').single()
    if (e1 || !trip) { setMsg('No se pudo crear el viaje: ' + (e1?.message ?? '')); setBusy(false); return }

    // Paradas en orden de ruta
    const stopsPayload = chosen.map((g, i) => ({
      trip_id: trip.id, space_key: g[0].space_key, entity: g[0].entity,
      lodge_num: g[0].lodge_num, bridge_num: g[0].bridge_num, space_name: g[0].space_name,
      sort_order: i,
    }))
    const { data: stops, error: e2 } = await supabase.from('trip_stops').insert(stopsPayload).select('id,space_key')
    if (e2 || !stops) { setMsg('Error al crear paradas: ' + (e2?.message ?? '')); setBusy(false); return }

    const stopId: Record<string, string> = Object.fromEntries(stops.map((s: any) => [s.space_key, s.id]))

    // Qué baja en cada parada
    // Agrupa las paradas por LODGE (o por piso en Main). Dentro de cada
    // grupo, el reparto va en orden de ruta arrastrando el sobrante:
    // solo se parkea una caja nueva cuando lo que traes ya no alcanza.
    const grupos: Record<string, any[]> = {}
    chosen.forEach(g => {
      const head = g[0]
      const gk = head.entity === 'outside' ? `lodge-${head.lodge_num}` : `piso-${head.space_name}`
      ;(grupos[gk] ||= []).push(g)
    })

    const stopItems: any[] = []
    Object.values(grupos).forEach(spacesDelGrupo => {
      // qué items aparecen en este lodge
      const itemIds = Array.from(new Set(spacesDelGrupo.flatMap(g => g.map((r: any) => r.item_id))))

      itemIds.forEach(itemId => {
        const item = ITEM_BY_ID[Number(itemId)]
        if (!item) return

        const needs: StopNeed[] = spacesDelGrupo.map(g => {
          const fila = g.find((r: any) => r.item_id === itemId)
          return { key: g[0].space_key, missing: fila ? fila.missing_pcs : 0 }
        })

        const alloc = allocateAcrossStops(item, needs)

        alloc.forEach((a, i) => {
          if (a.use <= 0) return
          const g = spacesDelGrupo[i]
          const fila = g.find((r: any) => r.item_id === itemId)
          stopItems.push({
            stop_id: stopId[a.key], trip_id: trip.id,
            item_id: item.id, item_name: item.es,
            units: Number(fila.steps_standard) - Number(fila.steps_present),
            steps_standard: Number(fila.steps_standard),
            pcs: a.use,
            park_boxes: a.park,
            from_carry: a.fromCarry,
            carry_after: a.carryAfter,
            delivered: false,
          })
        })
      })
    })
    const { error: e3 } = await supabase.from('trip_stop_items').insert(stopItems)
    if (e3) { setMsg('Error al armar las paradas: ' + e3.message); setBusy(false); return }

    // Lista de picking consolidada del boathouse
    // Del boathouse sacas exactamente las cajas que vas a parkear,
    // más las piezas sueltas de los lodges que no ameritan abrir caja.
    const agg: Record<number, { name: string; boxes: number; loose: number }> = {}
    stopItems.forEach((si: any) => {
      agg[si.item_id] ||= { name: si.item_name, boxes: 0, loose: 0 }
      agg[si.item_id].boxes += si.park_boxes
      if (si.park_boxes === 0 && si.from_carry === 0) agg[si.item_id].loose += si.pcs
    })
    const loadItems = Object.entries(agg)
      .filter(([, v]) => v.boxes > 0 || v.loose > 0)
      .map(([id, v]) => {
        const item = ITEM_BY_ID[Number(id)]
        return {
          trip_id: trip.id, item_id: Number(id), item_name: v.name,
          total_pcs: v.boxes * (item?.pcsBox ?? 0) + v.loose,
          boxes: v.boxes, remainder_pcs: v.loose, loaded: false,
        }
      })

    const { error: e4 } = await supabase.from('trip_load_items').insert(loadItems)
    if (e4) { setMsg('Error al armar la lista de carga: ' + e4.message); setBusy(false); return }

    onCreated()
  }

  return (
    <>
      <Section title="Paso 1 · Elige los bridges de este viaje">
        {spaces.length === 0 && (
          <p style={{ color: C.gray, margin: 0 }}>
            No hay faltantes registrados. Haz primero la ronda de inventario.
          </p>
        )}
        {spaces.map(g => {
          const head = g[0]
          const totalPcs = g.reduce((s, r) => s + r.missing_pcs, 0)
          return (
            <Check key={head.space_key} on={picked.has(head.space_key)} onClick={() => toggle(head.space_key)}>
              <strong>{spaceLabel(head)}</strong>
              <div style={{ fontSize: 12, color: C.gray }}>
                {g.length} item{g.length === 1 ? '' : 's'} · {totalPcs} pzs
              </div>
            </Check>
          )
        })}
      </Section>

      {picked.size > 0 && (
        <>
          <button onClick={create} disabled={busy} style={btn(busy ? C.gray : C.green)}>
            {busy ? 'Armando…' : `Armar viaje con ${picked.size} parada${picked.size === 1 ? '' : 's'}`}
          </button>
          {msg && <p style={{ color: C.red, fontSize: 13 }}>{msg}</p>}
        </>
      )}
    </>
  )
}

// ---------- PASO 2: cargar el carrito ----------
function LoadCart({ trip, onReady, onCancel }: { trip: Trip; onReady: () => void; onCancel: () => void }) {
  const [items, setItems] = useState<TripLoadItem[]>([])
  const [stops, setStops] = useState<TripStop[]>([])

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from('trip_load_items').select('*').eq('trip_id', trip.id).order('item_name'),
      supabase.from('trip_stops').select('*').eq('trip_id', trip.id).order('sort_order'),
    ])
    setItems((a.data ?? []) as TripLoadItem[])
    setStops((b.data ?? []) as TripStop[])
  }, [trip.id])
  useEffect(() => { load() }, [load])

  async function toggle(it: TripLoadItem) {
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, loaded: !x.loaded } : x))
    await supabase.from('trip_load_items').update({ loaded: !it.loaded }).eq('id', it.id)
  }

  async function start() {
    await supabase.from('trips').update({ status: 'entregando' }).eq('id', trip.id)
    onReady()
  }

  async function cancel() {
    if (!confirm('¿Cancelar este viaje? Los faltantes se quedan como están.')) return
    await supabase.from('trips').delete().eq('id', trip.id)
    onCancel()
  }

  const pending = items.filter(i => !i.loaded).length

  return (
    <>
      <Section title="Paso 2 · Carga el carrito">
        <p style={{ fontSize: 13, color: C.gray, marginTop: -4 }}>
          Todo lo que necesitas del boathouse para {stops.length} parada{stops.length === 1 ? '' : 's'}, en un solo viaje.
        </p>
        {items.map(it => (
          <Check key={it.id} on={it.loaded} onClick={() => toggle(it)}>
            <strong>{it.item_name}</strong>
            <div style={{ fontSize: 13, color: C.gray }}>
              {it.boxes > 0 && `${it.boxes} caja${it.boxes > 1 ? 's' : ''}`}
              {it.boxes > 0 && it.remainder_pcs > 0 && ' + '}
              {it.remainder_pcs > 0 && `${it.remainder_pcs} pzs`}
              {it.boxes === 0 && it.remainder_pcs === 0 && '—'}
            </div>
          </Check>
        ))}
      </Section>

      <Section title="Paradas de este viaje">
        {stops.map((s, i) => (
          <div key={s.id} style={{ ...row, borderBottom: i === stops.length - 1 ? 'none' : `1px solid ${C.line}` }}>
            <span>{i + 1}. {spaceLabel(s)}</span>
          </div>
        ))}
      </Section>

      <button onClick={start} style={btn(pending > 0 ? C.amber : C.green)}>
        {pending > 0 ? `Salir con ${pending} sin palomear` : 'Carrito listo · empezar ruta'}
      </button>
      <button onClick={cancel} style={{ ...btnGhost, width: '100%', marginTop: 8, color: C.red }}>Cancelar viaje</button>
    </>
  )
}

// ---------- PASO 3: ruta de entrega ----------
function Route({ trip, onDone }: { trip: Trip; onDone: () => void }) {
  const [stops, setStops] = useState<TripStop[]>([])
  const [items, setItems] = useState<TripStopItem[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from('trip_stops').select('*').eq('trip_id', trip.id).order('sort_order'),
      supabase.from('trip_stop_items').select('*').eq('trip_id', trip.id),
    ])
    setStops((a.data ?? []) as TripStop[])
    setItems((b.data ?? []) as TripStopItem[])
  }, [trip.id])
  useEffect(() => { load() }, [load])

  const current = stops.find(s => !s.delivered_at)
  const currentItems = current ? items.filter(i => i.stop_id === current.id) : []

  async function toggleItem(it: TripStopItem) {
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, delivered: !x.delivered } : x))
    await supabase.from('trip_stop_items').update({ delivered: !it.delivered }).eq('id', it.id)
  }

  async function finishStop() {
    if (!current || busy) return
    setBusy(true)
    const entregados = currentItems.filter(i => i.delivered)

    // Lo entregado deja el espacio en su estándar
    if (entregados.length > 0) {
      await Promise.all(entregados.map(i =>
        supabase.from('space_status')
          .update({
            steps_present: i.steps_standard,
            missing_pcs: 0,
            updated_by: trip.runner_name,
            updated_at: new Date().toISOString(),
          })
          .eq('space_key', current.space_key).eq('item_id', i.item_id)
      ))
    }
    await supabase.from('trip_stops').update({ delivered_at: new Date().toISOString() }).eq('id', current.id)

    const remaining = stops.filter(s => s.id !== current.id && !s.delivered_at).length
    if (remaining === 0) {
      await supabase.from('trips').update({ status: 'completo', closed_at: new Date().toISOString() }).eq('id', trip.id)
      setBusy(false); onDone(); return
    }
    await load()
    setBusy(false)
  }

  async function abandon() {
    if (!confirm('¿Terminar el viaje aquí? Las paradas no entregadas se quedan pendientes.')) return
    await supabase.from('trips').update({ status: 'completo', closed_at: new Date().toISOString() }).eq('id', trip.id)
    onDone()
  }

  const doneCount = stops.filter(s => s.delivered_at).length

  return (
    <>
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={sectionLabel}>Paso 3 · Ruta de entrega</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {stops.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: s.delivered_at ? C.green : (s.id === current?.id ? C.amber : C.line),
            }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.gray }}>{doneCount} de {stops.length} paradas entregadas</div>
      </div>

      {current ? (
        <Section title={`Parada ${doneCount + 1} · ${spaceLabel(current)}`}>
          {currentItems.length === 0 && <p style={{ color: C.gray, margin: 0 }}>Nada que bajar aquí.</p>}
          {currentItems.map(it => {
            const park = Number(it.park_boxes ?? 0)
            const carry = Number(it.carry_after ?? 0)
            return (
              <Check key={it.id} on={it.delivered} onClick={() => toggleItem(it)}>
                <strong>
                  {park > 0
                    ? `Parkea ${park} caja${park > 1 ? 's' : ''} · ${it.item_name}`
                    : `${it.pcs} pzs de lo que traes · ${it.item_name}`}
                </strong>
                <div style={{ fontSize: 12, color: C.gray }}>
                  deja {it.pcs} pzs ({fmt(Number(it.units))} unidades)
                  {carry > 0 && ` · te sobran ${carry} para el siguiente`}
                </div>
              </Check>
            )
          })}
          <button onClick={finishStop} disabled={busy} style={{ ...btn(busy ? C.gray : C.green), marginTop: 12 }}>
            {busy ? 'Guardando…' : 'Parada lista · siguiente'}
          </button>
        </Section>
      ) : (
        <p style={{ color: C.green }}>Viaje completo.</p>
      )}

      <button onClick={abandon} style={{ ...btnGhost, width: '100%', marginTop: 8, color: C.red }}>Terminar viaje aquí</button>
    </>
  )
}
