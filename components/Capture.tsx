import { useState, useEffect, useCallback } from 'react'
import {
  LODGES, PISOS, getItemsFor, getStandard,
  missingPcs, pcsToBoxes, fmt, allowsHalf, Entity, RestockType,
} from '@/lib/data'
import { Runner, spaceKey } from '@/lib/types'
import { api } from '@/lib/api'
import { C, btn, Section, Pick, input } from '@/lib/ui'

export default function Capture({ runner }: { runner: Runner }) {
  const [entity, setEntity] = useState<Entity | null>(null)
  const [lodge, setLodge] = useState<number | null>(null)
  const [piso, setPiso] = useState<string | null>(null)
  const [bridge, setBridge] = useState<number | null>(null)
  const [type, setType] = useState<RestockType | null>(null)
  const [present, setPresent] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState<Set<string>>(new Set())

  const loadDone = useCallback(async () => {
    try {
      const { reports } = await api.get('/api/progress')
      setDone(new Set(reports.map((r: any) => spaceKey(r.entity, r.lodge_num, r.bridge_num, r.space_name))))
    } catch {}
  }, [])
  useEffect(() => { loadDone() }, [loadDone])

  const ready = entity === 'outside' ? (lodge !== null && bridge !== null) : (entity === 'main' && piso !== null)
  const items = entity && type ? getItemsFor(entity, type, piso) : []

  async function save() {
    if (!entity || !type || !ready || saving) return
    setSaving(true); setMsg('')
    const payload: Record<number, number> = {}
    items.forEach(i => {
      const std = getStandard(i, entity, piso)!
      payload[i.id] = present[i.id] ?? std.steps
    })
    try {
      await api.post('/api/capture', { entity, lodge, bridge, piso, type, present: payload })
      setMsg('Guardado ✓')
      setBridge(null); setPresent({})
      loadDone()
    } catch (e: any) {
      setMsg('No se pudo guardar: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <>
      <Section title="1 · Dónde">
        <div style={{ display: 'flex', gap: 8 }}>
          <Pick label="Outside (Lodges)" active={entity === 'outside'} onClick={() => { setEntity('outside'); setPiso(null); setBridge(null); setPresent({}) }} />
          <Pick label="Main Hotel" active={entity === 'main'} onClick={() => { setEntity('main'); setLodge(null); setBridge(null); setPresent({}) }} />
        </div>
      </Section>

      {entity === 'outside' && (
        <Section title="2 · Lodge y Bridge">
          <select value={lodge ?? ''} onChange={e => { setLodge(e.target.value ? Number(e.target.value) : null); setBridge(null) }} style={input}>
            <option value="">Selecciona lodge</option>
            {LODGES.map(l => <option key={l.num} value={l.num}>{l.name}</option>)}
          </select>
          {lodge && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 10 }}>
              {Array.from({ length: LODGES.find(l => l.num === lodge)!.bridges }, (_, i) => {
                const n = i + 1
                const hecho = done.has(spaceKey('outside', lodge, n, null))
                return (
                  <button key={n} onClick={() => { setBridge(n); setPresent({}); setMsg('') }}
                    style={{
                      padding: '10px 4px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${bridge === n ? C.blue : C.line}`,
                      background: bridge === n ? C.blue : (hecho ? '#e8f2ea' : C.card),
                      color: bridge === n ? '#fff' : C.ink,
                    }}>B{n}{hecho ? ' ✓' : ''}</button>
                )
              })}
            </div>
          )}
        </Section>
      )}

      {entity === 'main' && (
        <Section title="2 · Piso">
          <select value={piso ?? ''} onChange={e => { setPiso(e.target.value || null); setPresent({}); setMsg('') }} style={input}>
            <option value="">Selecciona piso</option>
            {PISOS.map(p => <option key={p} value={p}>{p}{done.has(spaceKey('main', null, null, p)) ? ' ✓' : ''}</option>)}
          </select>
        </Section>
      )}

      {ready && (
        <Section title="3 · Tipo de restock">
          <div style={{ display: 'flex', gap: 8 }}>
            <Pick label="Profundidad" sub="todos los items" active={type === 'profundidad'} onClick={() => setType('profundidad')} />
            <Pick label="Urgente" sub="solo críticos" active={type === 'urgente'} onClick={() => setType('urgente')} />
          </div>
        </Section>
      )}

      {ready && type && entity && (
        <Section title={`4 · Qué hay (${items.length} items)`}>
          <p style={{ fontSize: 12, color: C.gray, marginTop: -4 }}>
            Mueve el slider a las unidades que <strong>SÍ hay</strong>. Lo que falta se calcula solo.
          </p>
          {items.map(item => {
            const std = getStandard(item, entity, piso)!
            const steps = present[item.id] ?? std.steps
            const pct = Math.round((steps / std.steps) * 100)
            const missing = std.steps - steps
            const pcs = missingPcs(item, entity, piso, steps)
            const { boxes, remainderPcs } = pcsToBoxes(item, pcs)
            const color = pct < 50 ? C.red : pct < 100 ? C.amber : C.green
            return (
              <div key={item.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <strong>{item.es}</strong>
                  <span style={{ color }}>{fmt(steps)} / {fmt(std.steps)} {std.steps === 1 ? std.unit : std.unitPlural}</span>
                </div>
                <input type="range" min={0} max={std.steps} step={allowsHalf(std) ? 0.5 : 1} value={steps}
                  onChange={e => setPresent(p => ({ ...p, [item.id]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: color, marginTop: 6 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray }}>
                  <span>{pct}% lleno</span>
                  <span style={{ color: missing > 0 ? C.red : C.green }}>
                    {missing > 0
                      ? `falta ${fmt(missing)} ${missing > 1 ? std.unitPlural : std.unit} → ${boxes > 0 ? `${boxes} caja${boxes > 1 ? 's' : ''}` : ''}${boxes > 0 && remainderPcs > 0 ? ' + ' : ''}${remainderPcs > 0 ? `${remainderPcs} pcs` : ''}`
                      : 'completo'}
                  </span>
                </div>
              </div>
            )
          })}
          <button onClick={save} disabled={saving} style={{ ...btn(saving ? C.gray : C.green), marginTop: 16 }}>
            {saving ? 'Guardando…' : 'Guardar espacio'}
          </button>
          {msg && <p style={{ fontSize: 13, color: msg.startsWith('Guardado') ? C.green : C.red, marginBottom: 0 }}>{msg}</p>}
        </Section>
      )}
    </>
  )
}
