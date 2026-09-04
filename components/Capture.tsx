import { useState, useEffect, useCallback } from 'react'
import {
  LODGES, PISOS, getItemsFor, getStandard,
  missingPcs, pcsToBoxes, fmt, allowsHalf,
  Entity, RestockType, groupByShelf,
} from '@/lib/data'
import { supabase, Runner, spaceKey } from '@/lib/supabase'
import { C, card, btn, Section, Pick, input } from '@/lib/ui'

export default function Capture({ runner }: { runner: Runner }) {
  const [entity, setEntity] = useState<Entity | null>(null)
  const [lodge, setLodge] = useState<number | null>(null)
  const [piso, setPiso] = useState<string | null>(null)
  const [bridge, setBridge] = useState<number | null>(null)
  const [type, setType] = useState<RestockType | null>(null)
  const [present, setPresent] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set())

  const loadDone = useCallback(async () => {
    const since = new Date(); since.setHours(0, 0, 0, 0)
    const { data } = await supabase.from('reports')
      .select('entity,lodge_num,bridge_num,space_name')
      .gte('created_at', since.toISOString())
    setDoneToday(new Set((data ?? []).map((r: any) => spaceKey(r.entity, r.lodge_num, r.bridge_num, r.space_name))))
  }, [])

  useEffect(() => { loadDone() }, [loadDone])

  const locationReady = entity === 'outside' ? (lodge !== null && bridge !== null) : (entity === 'main' && piso !== null)
  const visibleItems = entity && type ? getItemsFor(entity, type, piso) : []
  const key = entity ? spaceKey(entity, lodge, bridge, piso) : ''

  async function save() {
    if (!entity || !type || !locationReady || saving) return
    setSaving(true); setMsg('')

    const rows = visibleItems.map(item => {
      const std = getStandard(item, entity, piso)!
      const steps = present[item.id] ?? std.steps
      return {
        item_id: item.id,
        item_name: item.es,
        steps_present: steps,
        steps_standard: std.steps,
        missing_pcs: missingPcs(item, entity, piso, steps),
      }
    })

    const { data: report, error: e1 } = await supabase.from('reports').insert({
      runner_id: runner.id,
      runner_name: runner.name,
      entity,
      lodge_num: entity === 'outside' ? lodge : null,
      bridge_num: entity === 'outside' ? bridge : null,
      space_name: entity === 'main' ? piso : null,
      restock_type: type,
    }).select('id').single()

    if (e1 || !report) { setMsg('No se pudo guardar: ' + (e1?.message ?? 'error')); setSaving(false); return }

    const { error: e2 } = await supabase.from('report_items')
      .insert(rows.map(r => ({ ...r, report_id: report.id })))
    if (e2) { setMsg('Reporte guardado pero faltó el detalle: ' + e2.message); setSaving(false); return }

    const { error: e3 } = await supabase.from('space_status').upsert(
      rows.map(r => ({
        space_key: key,
        entity,
        lodge_num: entity === 'outside' ? lodge : null,
        bridge_num: entity === 'outside' ? bridge : null,
        space_name: entity === 'main' ? piso : null,
        updated_by: runner.name,
        updated_at: new Date().toISOString(),
        ...r,
      })),
      { onConflict: 'space_key,item_id' }
    )
    if (e3) setMsg('Guardado, pero el estado del espacio no se actualizó: ' + e3.message)
    else setMsg('Guardado ✓')

    setBridge(null); setPresent({})
    loadDone()
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
                const done = doneToday.has(spaceKey('outside', lodge, n, null))
                return (
                  <button key={n} onClick={() => { setBridge(n); setPresent({}); setMsg('') }}
                    style={{
                      padding: '10px 4px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      border: `1px solid ${bridge === n ? C.blue : C.line}`,
                      background: bridge === n ? C.blue : (done ? '#e8f2ea' : C.card),
                      color: bridge === n ? '#fff' : C.ink,
                    }}>B{n}{done ? ' ✓' : ''}</button>
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
            {PISOS.map(p => <option key={p} value={p}>{p}{doneToday.has(spaceKey('main', null, null, p)) ? ' ✓' : ''}</option>)}
          </select>
        </Section>
      )}

      {locationReady && (
        <Section title="3 · Tipo de restock">
          <div style={{ display: 'flex', gap: 8 }}>
            <Pick label="Profundidad" sub="todos los items" active={type === 'profundidad'} onClick={() => setType('profundidad')} />
            <Pick label="Urgente" sub="solo críticos" active={type === 'urgente'} onClick={() => setType('urgente')} />
          </div>
        </Section>
      )}

      {locationReady && type && entity && (
        <Section title={`4 · Qué hay (${visibleItems.length} items)`}>
          <p style={{ fontSize: 12, color: C.gray, marginTop: -4 }}>
            Mueve el slider a las unidades que <strong>SÍ hay</strong>. Lo que falta se calcula solo.
          </p>
          {groupByShelf(visibleItems, entity).map(({ shelf, items: delShelf }) => (
            <div key={shelf.id}>
              <div style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: C.gray,
                marginTop: 14, paddingTop: 10, borderTop: `2px solid ${C.line}`,
              }}>{shelf.nombre}</div>
          {delShelf.map(item => {
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

            </div>
          ))}
          <button onClick={save} disabled={saving} style={{ ...btn(saving ? C.gray : C.green), marginTop: 16 }}>
            {saving ? 'Guardando…' : 'Guardar espacio'}
          </button>
          {msg && <p style={{ fontSize: 13, color: msg.startsWith('Guardado ✓') ? C.green : C.red, marginBottom: 0 }}>{msg}</p>}
        </Section>
      )}
    </>
  )
}

