import { useState, useEffect, useCallback } from 'react'
import { supabase, Runner } from '@/lib/supabase'
import { C, card, row, btn, btnGhost, input, linkBtn, Section } from '@/lib/ui'
import { useT } from '@/lib/i18n'

interface RunnerFull extends Runner { pin: string }

export default function Admin({ runner }: { runner: Runner }) {
  const { t } = useT()
  const [list, setList] = useState<RunnerFull[]>([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('runner')
  const [msg, setMsg] = useState('')
  const [verPins, setVerPins] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('runners').select('id,name,role,active,pin').order('name')
    setList((data ?? []) as RunnerFull[])
  }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    setMsg('')
    if (!name.trim()) return setMsg(t('name'))
    if (!/^\d{4}$/.test(pin)) return setMsg(t('pinMust4'))
    const { error } = await supabase.from('runners').insert({ name: name.trim(), pin, role })
    if (error) return setMsg(error.message.includes('duplicate') ? t('nameTaken') : error.message)
    setName(''); setPin(''); setRole('runner'); setMsg(t('add') + ' ✓')
    load()
  }

  async function toggle(r: RunnerFull) {
    if (r.id === runner.id) return setMsg(t('cantDeactivateSelf'))
    await supabase.from('runners').update({ active: !r.active }).eq('id', r.id)
    load()
  }

  async function cambiarRol(r: RunnerFull, nuevo: string) {
    if (r.id === runner.id && nuevo !== 'admin') return setMsg(t('cantDropAdmin'))
    await supabase.from('runners').update({ role: nuevo }).eq('id', r.id)
    load()
  }

  async function resetPin(r: RunnerFull) {
    const p = prompt(`${t('newPinFor')} ${r.name}`)
    if (!p) return
    if (!/^\d{4}$/.test(p)) return setMsg(t('pinMust4'))
    await supabase.from('runners').update({ pin: p }).eq('id', r.id)
    setMsg(`${r.name}: ${t('pinChanged')} ✓`)
    load()
  }

  return (
    <>
      <Section title={t('addPerson')}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t('name')} style={input} />
        <input value={pin} inputMode="numeric" maxLength={4} placeholder={t('pin4')}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
        <select value={role} onChange={e => setRole(e.target.value)} style={{ ...input, marginTop: 8 }}>
          <option value="runner">{t('roleRunner')}</option>
          <option value="supervisor">{t('roleSup')}</option>
          <option value="admin">{t('roleAdmin')}</option>
        </select>
        <button onClick={add} style={{ ...btn(C.green), marginTop: 12 }}>{t('add')}</button>
      </Section>

      <Section title={`${t('team')} (${list.length})`}>
        <button onClick={() => setVerPins(v => !v)} style={{ ...btnGhost, marginBottom: 10 }}>
          {verPins ? t('hidePins') : t('showPins')}
        </button>

        {list.map(r => (
          <div key={r.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ opacity: r.active ? 1 : 0.45 }}>
                <strong>{r.name}</strong>
                {verPins && <span style={{ marginLeft: 8, fontFamily: 'monospace', color: C.blue }}>{r.pin}</span>}
                {!r.active && <span style={{ fontSize: 11, color: C.gray, marginLeft: 6 }}>{t('inactive')}</span>}
              </span>
              <select value={r.role} onChange={e => cambiarRol(r, e.target.value)}
                style={{ fontSize: 12, padding: '4px 6px', borderRadius: 6, border: `1px solid ${C.line}` }}>
                <option value="runner">{t('roleRunner')}</option>
                <option value="supervisor">{t('roleSup')}</option>
                <option value="admin">{t('roleAdmin')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
              <button onClick={() => resetPin(r)} style={{ ...linkBtn, color: C.blue }}>{t('changePin')}</button>
              <button onClick={() => toggle(r)} style={linkBtn}>{r.active ? t('deactivate') : t('activate')}</button>
            </div>
          </div>
        ))}
      </Section>

      {msg && <p style={{ fontSize: 13, color: msg.endsWith('✓') ? C.green : C.red }}>{msg}</p>}
    </>
  )
}
