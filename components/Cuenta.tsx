import { useState } from 'react'
import { supabase, Runner } from '@/lib/supabase'
import { C, btn, input, Section } from '@/lib/ui'

// Cada quien cambia su propio PIN. Pide el actual para que nadie
// se lo cambie a otro desde un teléfono que quedó abierto.
export default function Cuenta({ runner, onLogout }: { runner: Runner; onLogout: () => void }) {
  const [actual, setActual] = useState('')
  const [nuevo, setNuevo] = useState('')
  const [repetir, setRepetir] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function cambiar() {
    setMsg('')
    if (!/^\d{4}$/.test(nuevo)) return setMsg('El PIN nuevo debe ser de 4 dígitos.')
    if (nuevo !== repetir) return setMsg('Los dos PINs nuevos no coinciden.')
    if (nuevo === actual) return setMsg('El PIN nuevo es igual al actual.')

    setBusy(true)
    const { data } = await supabase.from('runners')
      .select('id').eq('id', runner.id).eq('pin', actual).maybeSingle()
    if (!data) { setMsg('Tu PIN actual no coincide.'); setBusy(false); return }

    const { error } = await supabase.from('runners').update({ pin: nuevo }).eq('id', runner.id)
    setBusy(false)
    if (error) return setMsg('No se pudo cambiar: ' + error.message)
    setActual(''); setNuevo(''); setRepetir(''); setMsg('PIN cambiado ✓')
  }

  return (
    <>
      <Section title="Mi cuenta">
        <p style={{ fontSize: 14, margin: 0 }}>
          <strong>{runner.name}</strong>
          <span style={{ color: C.gray, marginLeft: 8 }}>{runner.role}</span>
        </p>
      </Section>

      <Section title="Cambiar mi PIN">
        <input value={actual} type="password" inputMode="numeric" maxLength={4} placeholder="PIN actual"
          onChange={e => setActual(e.target.value.replace(/\D/g, '').slice(0, 4))} style={input} />
        <input value={nuevo} type="password" inputMode="numeric" maxLength={4} placeholder="PIN nuevo"
          onChange={e => setNuevo(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
        <input value={repetir} type="password" inputMode="numeric" maxLength={4} placeholder="Repite el PIN nuevo"
          onChange={e => setRepetir(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
        <button onClick={cambiar} disabled={busy} style={{ ...btn(busy ? C.gray : C.green), marginTop: 12 }}>
          {busy ? 'Guardando…' : 'Cambiar PIN'}
        </button>
        {msg && <p style={{ fontSize: 13, color: msg.endsWith('✓') ? C.green : C.red, marginBottom: 0 }}>{msg}</p>}
        <p style={{ fontSize: 12, color: C.gray, marginBottom: 0 }}>
          Si se te olvida, Rodrigo te lo puede resetear.
        </p>
      </Section>

      <button onClick={onLogout} style={{ ...btn(C.red), marginTop: 4 }}>Cerrar sesión</button>
    </>
  )
}
