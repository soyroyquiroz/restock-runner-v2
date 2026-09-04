import { useState, useEffect } from 'react'
import { supabase, Runner } from '@/lib/supabase'
import { loadOverrides } from '@/lib/data'
import { C, wrap, card, btnGhost, linkBtn, sectionLabel, input, Tab } from '@/lib/ui'
import Capture from '@/components/Capture'
import TripSection from '@/components/Trip'
import Progress from '@/components/Progress'
import Admin from '@/components/Admin'
import Catalogo from '@/components/Catalogo'
import Cuenta from '@/components/Cuenta'

type View = 'ronda' | 'viaje' | 'progreso' | 'runners' | 'catalogo' | 'cuenta'

export default function Home() {
  const [runner, setRunner] = useState<Runner | null>(null)
  const [view, setView] = useState<View>('ronda')

  useEffect(() => {
    // El catálogo editado en la base pisa los valores por defecto del código
    supabase.from('item_overrides').select('item_id,scope,steps,pcs_per_step,pcs_box')
      .then(({ data }) => { if (data) loadOverrides(data as any) })
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem('rr-session')
    if (raw) { try { setRunner(JSON.parse(raw)) } catch {} }
  }, [])

  if (!runner) return <Login onLogin={r => { setRunner(r); localStorage.setItem('rr-session', JSON.stringify(r)) }} />

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${C.line}`, marginBottom: 14 }}>
        <strong style={{ fontSize: 18 }}>Restock Runner</strong>
        <span style={{ fontSize: 13, color: C.gray }}>
          {runner.name} · <button onClick={() => { localStorage.removeItem('rr-session'); setRunner(null) }} style={linkBtn}>salir</button>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tab label="1 Ronda" active={view === 'ronda'} onClick={() => setView('ronda')} />
        <Tab label="2 Viaje" active={view === 'viaje'} onClick={() => setView('viaje')} />
        <Tab label="Progreso" active={view === 'progreso'} onClick={() => setView('progreso')} />
        {runner.role === 'admin' && <Tab label="Runners" active={view === 'runners'} onClick={() => setView('runners')} />}
        {runner.role === 'admin' && <Tab label="Catálogo" active={view === 'catalogo'} onClick={() => setView('catalogo')} />}
        <Tab label="Cuenta" active={view === 'cuenta'} onClick={() => setView('cuenta')} />
      </div>

      {view === 'ronda' && <Capture runner={runner} />}
      {view === 'viaje' && <TripSection runner={runner} />}
      {view === 'progreso' && <Progress />}
      {view === 'runners' && runner.role === 'admin' && <Admin runner={runner} />}
      {view === 'catalogo' && runner.role === 'admin' && <Catalogo runner={runner} />}
      {view === 'cuenta' && <Cuenta runner={runner} onLogout={() => { localStorage.removeItem('rr-session'); setRunner(null) }} />}
    </div>
  )
}

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
    const { data, error } = await supabase.from('runners')
      .select('id,name,role,active').eq('id', picked.id).eq('pin', value).maybeSingle()
    if (error) { setErr('Error de conexión.'); return }
    if (!data) { setErr('PIN incorrecto.'); setPin(''); return }
    onLogin(data as Runner)
  }

  const nameBtn: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left', padding: 13, marginBottom: 6,
    fontSize: 16, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer',
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
