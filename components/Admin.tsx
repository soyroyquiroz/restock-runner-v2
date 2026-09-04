import { useState, useEffect, useCallback } from 'react'
import { supabase, Runner } from '@/lib/supabase'
import { C, row, btn, input, linkBtn, Section } from '@/lib/ui'

export default function Admin() {
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

