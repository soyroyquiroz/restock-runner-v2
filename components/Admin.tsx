import { useState, useEffect, useCallback } from 'react'
import { Runner } from '@/lib/types'
import { api } from '@/lib/api'
import { C, row, btn, input, linkBtn, Section } from '@/lib/ui'

export default function Admin({ runner }: { runner: Runner }) {
  const [list, setList] = useState<Runner[]>([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('runner')
  const [msg, setMsg] = useState('')

  const isAdmin = runner.role === 'admin'

  const load = useCallback(async () => {
    try { const r = await api.get('/api/runners'); setList(r.runners) } catch (e: any) { setMsg(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    setMsg('')
    try {
      await api.post('/api/runners', { name, pin, role })
      setName(''); setPin(''); setRole('runner'); setMsg('Runner agregado ✓'); load()
    } catch (e: any) { setMsg(e.message) }
  }

  async function patch(r: Runner, body: any) {
    setMsg('')
    try { await api.patch(`/api/runners/${r.id}`, body); load() } catch (e: any) { setMsg(e.message) }
  }

  return (
    <>
      {isAdmin && (
        <Section title="Agregar runner">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" style={input} />
          <input value={pin} inputMode="numeric" maxLength={4} placeholder="PIN de 4 dígitos"
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...input, marginTop: 8 }}>
            <option value="runner">Runner — hace rondas y viajes, ve solo lo suyo</option>
            <option value="supervisor">Supervisor — ve la isla y cierra viajes ajenos</option>
            <option value="admin">Admin — todo, más alta y baja de gente</option>
          </select>
          <button onClick={add} style={{ ...btn(C.green), marginTop: 12 }}>Agregar</button>
        </Section>
      )}

      <Section title={`Plantilla (${list.length})`}>
        {list.map(r => (
          <div key={r.id} style={{ ...row, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ opacity: r.active ? 1 : 0.45 }}>
              {r.name} <span style={{ fontSize: 11, color: C.gray }}>{r.role}</span>
            </span>
            {isAdmin && (
              <span style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => {
                  const p = prompt(`PIN nuevo para ${r.name} (4 dígitos)`)
                  if (p) patch(r, { resetPin: p })
                }} style={{ ...linkBtn, color: C.blue }}>resetear PIN</button>
                <button onClick={() => patch(r, { active: !r.active })} style={linkBtn}>
                  {r.active ? 'desactivar' : 'activar'}
                </button>
              </span>
            )}
          </div>
        ))}
      </Section>

      {msg && <p style={{ fontSize: 13, color: msg.endsWith('✓') ? C.green : C.red }}>{msg}</p>}
    </>
  )
}
