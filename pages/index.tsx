import { useState, useEffect, useCallback } from 'react'
import {
  LODGES, PISOS, ITEM_BY_ID, getItemsFor, getStandard,
  missingPcs, pcsToBoxes, fmt, allowsHalf,
  Entity, RestockType, Item
} from '@/lib/data'
import { supabase, Runner, ReportRow, SpaceStatusRow, spaceKey, spaceLabel } from '@/lib/supabase'

const C = {
  ink: '#12211c', line: '#d6ded9', bg: '#f6f7f5', card: '#ffffff',
  green: '#2f7d5d', red: '#c0392b', amber: '#d68910', blue: '#2a6fb0', gray: '#8a948f',
}

type View = 'capture' | 'progress' | 'admin'

export default function Home() {
  const [runner, setRunner] = useState<Runner | null>(null)
  const [view, setView] = useState<View>('capture')

  useEffect(() => {
    const raw = localStorage.getItem('rr-session')
    if (raw) { try { setRunner(JSON.parse(raw)) } catch {} }
  }, [])

  function logout() {
    localStorage.removeItem('rr-session')
    setRunner(null)
  }

  if (!runner) return <Login onLogin={r => { setRunner(r); localStorage.setItem('rr-session', JSON.stringify(r)) }} />

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${C.line}`, marginBottom: 14 }}>
        <strong style={{ fontSize: 18 }}>Restock Runner</strong>
        <span style={{ fontSize: 13, color: C.gray }}>
          {runner.name} · <button onClick={logout} style={linkBtn}>salir</button>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <Tab label="Capturar" active={view === 'capture'} onClick={() => setView('capture')} />
        <Tab label="Progreso" active={view === 'progress'} onClick={() => setView('progress')} />
        {runner.role === 'admin' && <Tab label="Runners" active={view === 'admin'} onClick={() => setView('admin')} />}
      </div>

      {view === 'capture' && <Capture runner={runner} />}
      {view === 'progress' && <Progress />}
      {view === 'admin' && <Admin />}
    </div>
  )
}

// ==================== LOGIN ====================
function Login({ onLogin }: { onLogin: (r: Runner) => void }) {
  const [runners, setRunners] = useState<Runner[]>([])
  const [picked, setPicked] = useState<Runner | null>(null)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('runners').select('id,name,role,active').eq('active', true).order('name')
      .then(({ data, error }) => {
        if (error) setErr('No se pudo conectar a la base de datos.')
        else setRunners((data ?? []) as Runner[])
        setLoading(false)
      })
  }, [])

  async function tryPin(value: string) {
    if (!picked || value.length !== 4) return
    const { data, error } = await supabase
      .from('runners').select('id,name,role,active')
      .eq('id', picked.id).eq('pin', value).maybeSingle()
    if (error) { setErr('Error de conexión.'); return }
    if (!data) { setErr('PIN incorrecto.'); setPin(''); return }
    onLogin(data as Runner)
  }

  return (
    <div style={{ ...wrap, maxWidth: 380, paddingTop: 60 }}>
      <h1 style={{ fontSize: 26, marginBottom: 2 }}>Restock Runner</h1>
      <p style={{ color: C.gray, marginTop: 0 }}>Sagamore Resort</p>

      <div style={{ ...card, marginTop: 22 }}>
        {loading && <p style={{ color: C.gray, margin: 0 }}>Cargando…</p>}

        {!loading && !picked && (
          <>
            <div style={sectionLabel}>¿Quién eres?</div>
            {runners.length === 0 && <p style={{ color: C.gray, fontSize: 13 }}>No hay runners dados de alta todavía.</p>}
            {runners.map(r => (
              <button key={r.id} onClick={() => { setPicked(r); setErr('') }} style={nameBtn}>
                {r.name}
                {r.role !== 'runner' && <span style={{ fontSize: 11, color: C.gray, marginLeft: 6 }}>{r.role}</span>}
              </button>
            ))}
          </>
        )}

        {!loading && picked && (
          <>
            <div style={sectionLabel}>PIN de {picked.name}</div>
            <input
              value={pin} inputMode="numeric" autoFocus type="password" maxLength={4}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                setPin(v); setErr('')
                if (v.length === 4) tryPin(v)
              }}
              placeholder="••••"
              style={{ ...input, textAlign: 'center', fontSize: 30, letterSpacing: 12 }}
            />
            <button onClick={() => { setPicked(null); setPin(''); setErr('') }} style={{ ...btnGhost, marginTop: 10 }}>← Cambiar de nombre</button>
          </>
        )}

        {err && <p style={{ color: C.red, fontSize: 13, marginBottom: 0 }}>{err}</p>}
      </div>
    </div>
  )
}

// ==================== CAPTURA ====================
function Capture({ runner }: { runner: Runner }) {
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
          {visibleItems.map(item => {
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
          {msg && <p style={{ fontSize: 13, color: msg.startsWith('Guardado ✓') ? C.green : C.red, marginBottom: 0 }}>{msg}</p>}
        </Section>
      )}
    </>
  )
}

// ==================== PROGRESO ====================
function Progress() {
  const [sub, setSub] = useState<'hoy' | 'inventario'>('hoy')
  const [reports, setReports] = useState<ReportRow[]>([])
  const [status, setStatus] = useState<SpaceStatusRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date(); since.setHours(0, 0, 0, 0)
    const [a, b] = await Promise.all([
      supabase.from('reports').select('*').gte('created_at', since.toISOString()).order('created_at', { ascending: false }),
      supabase.from('space_status').select('*').order('updated_at', { ascending: false }),
    ])
    setReports((a.data ?? []) as ReportRow[])
    setStatus((b.data ?? []) as SpaceStatusRow[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Total consolidado del boathouse a partir de lo que falta ahora mismo
  const totals: Record<number, number> = {}
  status.forEach(s => { if (s.missing_pcs > 0) totals[s.item_id] = (totals[s.item_id] || 0) + s.missing_pcs })

  const bySpace = status.reduce((acc: Record<string, SpaceStatusRow[]>, s) => {
    (acc[s.space_key] ||= []).push(s); return acc
  }, {})

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <Tab label="Hoy" active={sub === 'hoy'} onClick={() => setSub('hoy')} />
        <Tab label="Inventario" active={sub === 'inventario'} onClick={() => setSub('inventario')} />
        <button onClick={load} style={{ ...btnGhost, marginLeft: 'auto' }}>↻</button>
      </div>

      {loading && <p style={{ color: C.gray }}>Cargando…</p>}

      {!loading && sub === 'hoy' && (
        <>
          <div style={sectionLabel}>{reports.length} espacio{reports.length === 1 ? '' : 's'} surtido{reports.length === 1 ? '' : 's'} hoy</div>
          {reports.length === 0 && <p style={{ color: C.gray }}>Nadie ha capturado nada hoy.</p>}
          {reports.map(r => (
            <div key={r.id} style={{ ...card, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{spaceLabel(r)}</strong>
                <div style={{ fontSize: 12, color: C.gray }}>{r.runner_name} · {r.restock_type}</div>
              </div>
              <span style={{ fontSize: 12, color: C.gray }}>
                {new Date(r.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </>
      )}

      {!loading && sub === 'inventario' && (
        <>
          <div style={sectionLabel}>Sacar del boathouse (faltante actual de toda la isla)</div>
          {Object.keys(totals).length === 0 ? (
            <p style={{ color: C.gray }}>Sin faltantes registrados.</p>
          ) : (
            <div style={{ ...card, marginBottom: 18 }}>
              {Object.entries(totals).map(([id, pcs]) => {
                const item = ITEM_BY_ID[Number(id)]
                if (!item) return null
                const { boxes, remainderPcs } = pcsToBoxes(item, pcs)
                return (
                  <div key={id} style={row}>
                    <span style={{ fontWeight: 600 }}>{item.es}</span>
                    <span style={{ textAlign: 'right' }}>
                      <strong style={{ color: C.green }}>{boxes > 0 ? `${boxes} caja${boxes > 1 ? 's' : ''}` : '—'}</strong>
                      {remainderPcs > 0 && <span style={{ color: C.gray, fontSize: 12, display: 'block' }}>+ {remainderPcs} pcs</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={sectionLabel}>Nivel por espacio</div>
          {Object.entries(bySpace).map(([k, rows]) => {
            const faltan = rows.filter(r => r.missing_pcs > 0)
            const head = rows[0]
            return (
              <div key={k} style={{ ...card, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{spaceLabel(head)}</strong>
                  <span style={{ fontSize: 11, color: C.gray }}>
                    {head.updated_by} · {new Date(head.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                {faltan.length === 0 ? (
                  <p style={{ color: C.green, margin: 0, fontSize: 13 }}>Completo</p>
                ) : faltan.map(r => (
                  <div key={r.item_id} style={{ ...row, borderBottom: 'none', padding: '3px 0' }}>
                    <span style={{ fontSize: 13 }}>{r.item_name}</span>
                    <span style={{ fontSize: 13, color: C.red }}>{fmt(Number(r.steps_present))} / {fmt(Number(r.steps_standard))}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

// ==================== ADMIN: alta de runners ====================
function Admin() {
  const [list, setList] = useState<Runner[]>([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('runner')
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('runners').select('id,name,role,active').order('name')
    setList((data ?? []) as Runner[])
  }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    setMsg('')
    if (!name.trim()) return setMsg('Falta el nombre.')
    if (!/^\d{4}$/.test(pin)) return setMsg('El PIN debe ser de 4 dígitos.')
    const { error } = await supabase.from('runners').insert({ name: name.trim(), pin, role })
    if (error) return setMsg(error.message.includes('duplicate') ? 'Ya existe un runner con ese nombre.' : error.message)
    setName(''); setPin(''); setRole('runner'); setMsg('Runner agregado ✓')
    load()
  }

  async function toggle(r: Runner) {
    await supabase.from('runners').update({ active: !r.active }).eq('id', r.id)
    load()
  }

  return (
    <>
      <Section title="Agregar runner">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" style={input} />
        <input value={pin} inputMode="numeric" maxLength={4} placeholder="PIN de 4 dígitos"
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          style={{ ...input, marginTop: 8 }} />
        <select value={role} onChange={e => setRole(e.target.value)} style={{ ...input, marginTop: 8 }}>
          <option value="runner">Runner</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={add} style={{ ...btn(C.green), marginTop: 12 }}>Agregar</button>
        {msg && <p style={{ fontSize: 13, color: msg.endsWith('✓') ? C.green : C.red, marginBottom: 0 }}>{msg}</p>}
      </Section>

      <Section title={`Runners (${list.length})`}>
        {list.map(r => (
          <div key={r.id} style={row}>
            <span style={{ opacity: r.active ? 1 : 0.45 }}>
              {r.name} <span style={{ fontSize: 11, color: C.gray }}>{r.role}</span>
            </span>
            <button onClick={() => toggle(r)} style={linkBtn}>{r.active ? 'desactivar' : 'activar'}</button>
          </div>
        ))}
      </Section>
    </>
  )
}

// ==================== UI ====================
const wrap: React.CSSProperties = { maxWidth: 620, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif', color: C.ink, background: C.bg, minHeight: '100vh' }
const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.line}` }
const input: React.CSSProperties = { width: '100%', padding: 11, fontSize: 15, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', boxSizing: 'border-box' }
const btnGhost: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer', fontSize: 13 }
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 13, padding: 0 }
const sectionLabel: React.CSSProperties = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: C.gray, marginBottom: 10 }
const nameBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: 13, marginBottom: 6, fontSize: 16, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer' }
function btn(bg: string): React.CSSProperties {
  return { width: '100%', padding: 13, fontSize: 15, fontWeight: 600, background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ ...card, marginBottom: 12 }}><div style={sectionLabel}>{title}</div>{children}</div>
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
      border: `1px solid ${active ? C.ink : C.line}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink,
    }}>{label}</button>
  )
}

function Pick({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '12px 8px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
      border: `1px solid ${active ? C.green : C.line}`, background: active ? C.green : '#fff', color: active ? '#fff' : C.ink,
    }}>
      {label}{sub && <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{sub}</div>}
    </button>
  )
}
