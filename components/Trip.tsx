import { useState, useEffect, useCallback } from 'react'
import { ITEM_BY_ID, pcsToBoxes, fmt } from '@/lib/data'
import { Runner, SpaceStatusRow, Trip, TripStop, TripStopItem, TripLoadItem, spaceLabel, routeSort } from '@/lib/types'
import { api } from '@/lib/api'
import { C, card, row, btn, btnGhost, sectionLabel, Section, Check } from '@/lib/ui'

export default function TripSection({ runner }: { runner: Runner }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [others, setOthers] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/trips')
      setTrip(r.trip); setOthers(r.others ?? [])
    } catch {}
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  if (loading) return <p style={{ color: C.gray }}>Cargando…</p>

  return (
    <>
      {!trip && <BuildTrip onCreated={load} />}
      {trip?.status === 'cargando' && <LoadCart trip={trip} reload={load} />}
      {trip?.status === 'entregando' && <Route trip={trip} reload={load} />}

      {others.length > 0 && (
        <Section title={`Viajes abiertos de otros (${others.length})`}>
          {others.map(t => (
            <div key={t.id} style={row}>
              <span>{t.runner_name} <span style={{ fontSize: 12, color: C.gray }}>{t.status}</span></span>
              <button onClick={async () => {
                if (!confirm(`¿Cerrar el viaje de ${t.runner_name}?`)) return
                await api.post(`/api/trips/${t.id}`, { action: 'close' }); load()
              }} style={{ ...btnGhost, fontSize: 12 }}>Cerrar</button>
            </div>
          ))}
        </Section>
      )}
    </>
  )
}

function BuildTrip({ onCreated }: { onCreated: () => void }) {
  const [rows, setRows] = useState<SpaceStatusRow[]>([])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get('/api/spaces').then(r => setRows(r.spaces)).catch(() => {}) }, [])

  const spaces = Object.values(
    rows.reduce((acc: Record<string, SpaceStatusRow[]>, r) => { (acc[r.space_key] ||= []).push(r); return acc }, {})
  ).sort((a, b) => routeSort(a[0], b[0]))

  async function create() {
    if (picked.size === 0 || busy) return
    setBusy(true); setMsg('')
    try {
      await api.post('/api/trips', { spaceKeys: [...picked] })
      onCreated()
    } catch (e: any) { setMsg(e.message); setBusy(false) }
  }

  return (
    <>
      <Section title="Paso 1 · Elige los bridges de este viaje">
        {spaces.length === 0 && <p style={{ color: C.gray, margin: 0 }}>No hay faltantes. Haz primero la ronda de inventario.</p>}
        {spaces.map(g => {
          const head = g[0]
          const on = picked.has(head.space_key)
          return (
            <Check key={head.space_key} on={on} onClick={() =>
              setPicked(p => { const n = new Set(p); on ? n.delete(head.space_key) : n.add(head.space_key); return n })}>
              <strong>{spaceLabel(head)}</strong>
              <div style={{ fontSize: 12, color: C.gray }}>
                {g.length} item{g.length === 1 ? '' : 's'} · {g.reduce((s, r) => s + r.missing_pcs, 0)} pzs
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

function LoadCart({ trip, reload }: { trip: Trip; reload: () => void }) {
  const [items, setItems] = useState<TripLoadItem[]>([])
  const [stops, setStops] = useState<TripStop[]>([])

  const load = useCallback(async () => {
    const r = await api.get(`/api/trips/${trip.id}`)
    setItems(r.load); setStops(r.stops)
  }, [trip.id])
  useEffect(() => { load() }, [load])

  async function toggle(it: TripLoadItem) {
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, loaded: !x.loaded } : x))
    await api.post(`/api/trips/${trip.id}`, { action: 'toggleLoad', itemId: it.id, value: !it.loaded })
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
            </div>
          </Check>
        ))}
      </Section>

      <Section title="Paradas de este viaje">
        {stops.map((s, i) => <div key={s.id} style={{ ...row, borderBottom: i === stops.length - 1 ? 'none' : undefined }}>
          <span>{i + 1}. {spaceLabel(s)}</span>
        </div>)}
      </Section>

      <button onClick={async () => { await api.post(`/api/trips/${trip.id}`, { action: 'startRoute' }); reload() }}
        style={btn(pending > 0 ? C.amber : C.green)}>
        {pending > 0 ? `Salir con ${pending} sin palomear` : 'Carrito listo · empezar ruta'}
      </button>
      <button onClick={async () => {
        if (!confirm('¿Cancelar este viaje?')) return
        await api.post(`/api/trips/${trip.id}`, { action: 'cancel' }); reload()
      }} style={{ ...btnGhost, width: '100%', marginTop: 8, color: C.red }}>Cancelar viaje</button>
    </>
  )
}

function Route({ trip, reload }: { trip: Trip; reload: () => void }) {
  const [stops, setStops] = useState<TripStop[]>([])
  const [items, setItems] = useState<TripStopItem[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await api.get(`/api/trips/${trip.id}`)
    setStops(r.stops); setItems(r.items)
  }, [trip.id])
  useEffect(() => { load() }, [load])

  const current = stops.find(s => !s.delivered_at)
  const currentItems = current ? items.filter(i => i.stop_id === current.id) : []
  const doneCount = stops.filter(s => s.delivered_at).length

  async function toggle(it: TripStopItem) {
    setItems(prev => prev.map(x => x.id === it.id ? { ...x, delivered: !x.delivered } : x))
    await api.post(`/api/trips/${trip.id}`, { action: 'toggleDeliver', itemId: it.id, value: !it.delivered })
  }

  async function finish() {
    if (!current || busy) return
    setBusy(true)
    const r = await api.post(`/api/trips/${trip.id}`, { action: 'finishStop', stopId: current.id })
    if (r.tripClosed) reload(); else await load()
    setBusy(false)
  }

  return (
    <>
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={sectionLabel}>Paso 3 · Ruta de entrega</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {stops.map(s => <div key={s.id} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: s.delivered_at ? C.green : (s.id === current?.id ? C.amber : C.line),
          }} />)}
        </div>
        <div style={{ fontSize: 13, color: C.gray }}>{doneCount} de {stops.length} paradas entregadas</div>
      </div>

      {current && (
        <Section title={`Parada ${doneCount + 1} · ${spaceLabel(current)}`}>
          {currentItems.map(it => (
            <Check key={it.id} on={it.delivered} onClick={() => toggle(it)}>
              <strong>{it.item_name}</strong>
              <div style={{ fontSize: 12, color: C.gray }}>{fmt(Number(it.units))} unidades · {it.pcs} pzs</div>
            </Check>
          ))}
          <button onClick={finish} disabled={busy} style={{ ...btn(busy ? C.gray : C.green), marginTop: 12 }}>
            {busy ? 'Guardando…' : 'Parada lista · siguiente'}
          </button>
        </Section>
      )}

      <button onClick={async () => {
        if (!confirm('¿Terminar el viaje aquí? Las paradas no entregadas se quedan pendientes.')) return
        await api.post(`/api/trips/${trip.id}`, { action: 'close' }); reload()
      }} style={{ ...btnGhost, width: '100%', marginTop: 8, color: C.red }}>Terminar viaje aquí</button>
    </>
  )
}
