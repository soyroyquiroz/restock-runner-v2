import { useState, useEffect } from 'react'
import {
  LODGES, PISOS, ITEMS, ITEM_BY_ID, getItemsFor, getStandard,
  missingPcs, pcsToBoxes, fmt,
  Entity, RestockType, Item
} from '@/lib/data'

interface Entry {
  id: string
  entity: Entity
  lodge: number | null
  piso: string | null
  bridge: number | null
  type: RestockType
  // itemId -> unidades visuales PRESENTES
  present: Record<number, number>
}

const C = {
  ink: '#12211c', line: '#d6ded9', bg: '#f6f7f5', card: '#ffffff',
  green: '#2f7d5d', red: '#c0392b', amber: '#d68910', blue: '#2a6fb0', gray: '#8a948f',
}

export default function Home() {
  const [user, setUser] = useState('')
  const [tempUser, setTempUser] = useState('')
  const [view, setView] = useState<'capture' | 'report'>('capture')

  const [entity, setEntity] = useState<Entity | null>(null)
  const [lodge, setLodge] = useState<number | null>(null)
  const [piso, setPiso] = useState<string | null>(null)
  const [bridge, setBridge] = useState<number | null>(null)
  const [type, setType] = useState<RestockType | null>(null)
  const [present, setPresent] = useState<Record<number, number>>({})

  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const u = localStorage.getItem('rr-user')
    if (u) setUser(u)
    const e = localStorage.getItem('rr-entries')
    if (e) { try { setEntries(JSON.parse(e)) } catch {} }
  }, [])

  useEffect(() => {
    localStorage.setItem('rr-entries', JSON.stringify(entries))
  }, [entries])

  // ---------- login ----------
  if (!user) {
    return (
      <div style={{ maxWidth: 380, margin: '80px auto', padding: 20, fontFamily: 'system-ui, sans-serif', color: C.ink }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Restock Runner</h1>
        <p style={{ color: C.gray, marginTop: 0 }}>Sagamore Resort</p>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18, marginTop: 24 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Tu nombre</label>
          <input
            value={tempUser}
            onChange={e => setTempUser(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && tempUser.trim()) { setUser(tempUser.trim()); localStorage.setItem('rr-user', tempUser.trim()) } }}
            placeholder="Rodrigo"
            style={{ width: '100%', padding: 12, fontSize: 16, marginTop: 8, marginBottom: 14, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: 'border-box' }}
          />
          <button
            onClick={() => { if (tempUser.trim()) { setUser(tempUser.trim()); localStorage.setItem('rr-user', tempUser.trim()) } }}
            style={btn(C.green)}
          >Entrar</button>
        </div>
      </div>
    )
  }

  const locationReady = entity === 'outside' ? (lodge !== null && bridge !== null) : (entity === 'main' && piso !== null)
  const visibleItems = entity && type ? getItemsFor(entity, type, piso) : []

  const locationLabel = (e: Entry) =>
    e.entity === 'outside' ? `Lodge ${e.lodge} · Bridge ${e.bridge}` : `${e.piso}`

  const currentKey = entity === 'outside' ? `o-${lodge}-${bridge}` : `m-${piso}`
  const alreadyCaptured = entries.filter(e =>
    (e.entity === 'outside' ? `o-${e.lodge}-${e.bridge}` : `m-${e.piso}`) === currentKey
  ).length

  function setStep(itemId: number, steps: number) {
    setPresent(p => ({ ...p, [itemId]: steps }))
  }

  function addEntry() {
    if (!entity || !type || !locationReady) return
    const filled: Record<number, number> = {}
    visibleItems.forEach(i => {
      const std = getStandard(i, entity!, piso)
      filled[i.id] = present[i.id] ?? (std ? std.steps : 0)
    })
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entity, lodge: entity === 'outside' ? lodge : null,
      piso: entity === 'main' ? piso : null,
      bridge: entity === 'outside' ? bridge : null,
      type, present: filled,
    }
    setEntries(prev => [...prev, entry])
    // Mantiene lodge y tipo — solo limpia bridge e items para seguir con el siguiente
    setBridge(null)
    setPresent({})
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function clearAll() {
    if (!confirm('¿Borrar todo el reporte acumulado?')) return
    setEntries([])
    setBridge(null); setPresent({}); setType(null)
  }

  // ---------- totales ----------
  const totals: Record<number, number> = {}   // itemId -> piezas faltantes
  entries.forEach(e => {
    Object.entries(e.present).forEach(([id, steps]) => {
      const item = ITEM_BY_ID[Number(id)]
      if (!item) return
      const pcs = missingPcs(item, e.entity, e.piso, steps)
      if (pcs > 0) totals[item.id] = (totals[item.id] || 0) + pcs
    })
  })
  const totalItems = Object.keys(totals).length

  // ================= REPORT VIEW =================
  if (view === 'report') {
    return (
      <div style={wrap}>
        <Header user={user} onLogout={() => { localStorage.removeItem('rr-user'); setUser('') }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setView('capture')} style={btnGhost}>← Volver a capturar</button>
        </div>

        <h2 style={h2}>Sacar del Boathouse</h2>
        {totalItems === 0 ? (
          <p style={{ color: C.gray }}>Todavía no hay nada faltante registrado.</p>
        ) : (
          <div style={card}>
            {Object.entries(totals).map(([id, pcs]) => {
              const item = ITEM_BY_ID[Number(id)]
              const { boxes, remainderPcs } = pcsToBoxes(item, pcs)
              return (
                <div key={id} style={row}>
                  <span style={{ fontWeight: 600 }}>{item.es}</span>
                  <span style={{ textAlign: 'right' }}>
                    <strong style={{ color: C.green, fontSize: 16 }}>
                      {boxes > 0 ? `${boxes} caja${boxes > 1 ? 's' : ''}` : '—'}
                    </strong>
                    {remainderPcs > 0 && (
                      <span style={{ color: C.gray, fontSize: 12, display: 'block' }}>
                        + {remainderPcs} pcs sueltas
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <h2 style={h2}>Desglose por espacio ({entries.length})</h2>
        {entries.map(e => {
          const faltantes = Object.entries(e.present)
            .map(([id, steps]) => {
              const item = ITEM_BY_ID[Number(id)]
              const std = item ? getStandard(item, e.entity, e.piso) : null
              return { item, steps, std }
            })
            .filter(x => x.item && x.std && x.steps < x.std.steps)
          return (
            <div key={e.id} style={{ ...card, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong>{locationLabel(e)}</strong>
                <span style={{ fontSize: 11, color: C.gray, textTransform: 'uppercase' }}>{e.type}</span>
              </div>
              {faltantes.length === 0 ? (
                <p style={{ color: C.green, margin: 0, fontSize: 13 }}>Completo</p>
              ) : faltantes.map(({ item, steps, std }) => {
                const missing = std!.steps - steps
                return (
                  <div key={item.id} style={{ ...row, borderBottom: 'none', padding: '4px 0' }}>
                    <span style={{ fontSize: 13 }}>{item.es}</span>
                    <span style={{ fontSize: 13, color: C.red }}>
                      falta {fmt(missing)} {missing > 1 ? std!.unitPlural : std!.unit}
                    </span>
                  </div>
                )
              })}
              <button onClick={() => removeEntry(e.id)} style={{ ...btnGhost, marginTop: 8, fontSize: 12, color: C.red, borderColor: C.line }}>Quitar</button>
            </div>
          )
        })}

        {entries.length > 0 && (
          <button onClick={clearAll} style={{ ...btn(C.red), marginTop: 12 }}>Cerrar y borrar reporte</button>
        )}
      </div>
    )
  }

  // ================= CAPTURE VIEW =================
  return (
    <div style={wrap}>
      <Header user={user} onLogout={() => { localStorage.removeItem('rr-user'); setUser('') }} />

      <button onClick={() => setView('report')} style={{ ...btn(C.blue), marginBottom: 16 }}>
        Ver reporte ({entries.length} espacio{entries.length === 1 ? '' : 's'})
      </button>

      {/* 1. Entidad */}
      <Section title="1 · Dónde">
        <div style={{ display: 'flex', gap: 8 }}>
          <Pick label="Outside (Lodges)" active={entity === 'outside'} onClick={() => { setEntity('outside'); setPiso(null); setBridge(null); setPresent({}) }} />
          <Pick label="Main Hotel" active={entity === 'main'} onClick={() => { setEntity('main'); setLodge(null); setBridge(null); setPresent({}) }} />
        </div>
      </Section>

      {/* 2. Ubicación */}
      {entity === 'outside' && (
        <Section title="2 · Lodge y Bridge">
          <select value={lodge ?? ''} onChange={e => { setLodge(e.target.value ? Number(e.target.value) : null); setBridge(null) }} style={select}>
            <option value="">Selecciona lodge</option>
            {LODGES.map(l => <option key={l.num} value={l.num}>{l.name}</option>)}
          </select>
          {lodge && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 10 }}>
              {Array.from({ length: LODGES.find(l => l.num === lodge)!.bridges }, (_, i) => {
                const n = i + 1
                const done = entries.some(e => e.lodge === lodge && e.bridge === n)
                return (
                  <button key={n} onClick={() => { setBridge(n); setPresent({}) }}
                    style={{
                      padding: '10px 4px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${bridge === n ? C.blue : C.line}`,
                      background: bridge === n ? C.blue : (done ? '#e8f2ea' : C.card),
                      color: bridge === n ? '#fff' : C.ink,
                    }}>
                    B{n}{done ? ' ✓' : ''}
                  </button>
                )
              })}
            </div>
          )}
        </Section>
      )}

      {entity === 'main' && (
        <Section title="2 · Piso">
          <select value={piso ?? ''} onChange={e => { setPiso(e.target.value || null); setPresent({}) }} style={select}>
            <option value="">Selecciona piso</option>
            {PISOS.map(p => <option key={p} value={p}>{p}{entries.some(e => e.piso === p) ? ' ✓' : ''}</option>)}
          </select>
        </Section>
      )}

      {/* 3. Tipo */}
      {locationReady && (
        <Section title="3 · Tipo de restock">
          <div style={{ display: 'flex', gap: 8 }}>
            <Pick label="Profundidad" sub="todos los items" active={type === 'profundidad'} onClick={() => setType('profundidad')} />
            <Pick label="Urgente" sub="solo críticos" active={type === 'urgente'} onClick={() => setType('urgente')} />
          </div>
          {alreadyCaptured > 0 && (
            <p style={{ fontSize: 12, color: C.amber, marginBottom: 0 }}>
              Ya registraste este espacio {alreadyCaptured} vez{alreadyCaptured > 1 ? 'es' : ''} en este reporte. Puedes volver a registrarlo.
            </p>
          )}
        </Section>
      )}

      {/* 4. Items */}
      {locationReady && type && entity && (
        <Section title={`4 · Qué hay (${visibleItems.length} items)`}>
          <p style={{ fontSize: 12, color: C.gray, marginTop: -4 }}>
            Mueve el slider a las unidades que <strong>SÍ hay</strong>. Lo que falta se calcula solo.
          </p>
          {visibleItems.map(item => {
            const std = getStandard(item, entity, piso)!
            const steps = present[item.id] ?? std.steps
            const pct = Math.round((steps / std.steps) * 100)
            const missing = std.steps - steps
            const color = pct < 50 ? C.red : pct < 100 ? C.amber : C.green
            return (
              <div key={item.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <strong>{item.es}</strong>
                  <span style={{ color }}>{fmt(steps)} / {fmt(std.steps)} {std.steps === 1 ? std.unit : std.unitPlural}</span>
                </div>
                <input
                  type="range" min={0} max={std.steps} step={std.allowHalf ? 0.5 : 1} value={steps}
                  onChange={e => setStep(item.id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: color, marginTop: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray }}>
                  <span>{pct}% lleno</span>
                  <span style={{ color: missing > 0 ? C.red : C.green }}>
                    {missing > 0
                      ? `falta ${fmt(missing)} ${missing > 1 ? std.unitPlural : std.unit} (${missingPcs(item, entity, piso, steps)} pcs)`
                      : 'completo'}
                  </span>
                </div>
              </div>
            )
          })}

          <button onClick={addEntry} style={{ ...btn(C.green), marginTop: 16 }}>
            Agregar al reporte y seguir
          </button>
        </Section>
      )}
    </div>
  )
}

// ---------- UI helpers ----------
const wrap: React.CSSProperties = { maxWidth: 620, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif', color: C.ink, background: C.bg, minHeight: '100vh' }
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.line}` }
const h2: React.CSSProperties = { fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5, color: C.gray, marginTop: 22, marginBottom: 8 }
const select: React.CSSProperties = { width: '100%', padding: 11, fontSize: 15, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', boxSizing: 'border-box' }
const btnGhost: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer', fontSize: 13 }
function btn(bg: string): React.CSSProperties {
  return { width: '100%', padding: 13, fontSize: 15, fontWeight: 600, background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}

function Header({ user, onLogout }: { user: string; onLogout: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${C.line}`, marginBottom: 16 }}>
      <strong style={{ fontSize: 18 }}>Restock Runner</strong>
      <span style={{ fontSize: 13, color: C.gray }}>
        {user} · <button onClick={onLogout} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 13, padding: 0 }}>salir</button>
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card, marginBottom: 12 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: C.gray, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function Pick({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '12px 8px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
      border: `1px solid ${active ? C.green : C.line}`, background: active ? C.green : '#fff', color: active ? '#fff' : C.ink,
    }}>
      {label}
      {sub && <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{sub}</div>}
    </button>
  )
}
