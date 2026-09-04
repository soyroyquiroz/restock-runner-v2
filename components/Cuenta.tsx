import { useState } from 'react'
import { supabase, Runner } from '@/lib/supabase'
import { C, btn, btnGhost, input, Section } from '@/lib/ui'
import { useT, Lang } from '@/lib/i18n'

export default function Cuenta({ runner, lang, onChangeLang, onLogout }: {
  runner: Runner; lang: Lang; onChangeLang: (l: Lang) => void; onLogout: () => void
}) {
  const { t } = useT()
  const [actual, setActual] = useState('')
  const [nuevo, setNuevo] = useState('')
  const [repetir, setRepetir] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  async function cambiar() {
    setMsg(''); setOk(false)
    if (!/^\d{4}$/.test(nuevo)) return setMsg(t('pinMust4'))
    if (nuevo !== repetir) return setMsg(t('pinsDontMatch'))
    if (nuevo === actual) return setMsg(t('pinSameAsOld'))

    setBusy(true)
    const { data } = await supabase.from('runners')
      .select('id').eq('id', runner.id).eq('pin', actual).maybeSingle()
    if (!data) { setMsg(t('wrongCurrent')); setBusy(false); return }

    const { error } = await supabase.from('runners').update({ pin: nuevo }).eq('id', runner.id)
    setBusy(false)
    if (error) return setMsg(error.message)
    setActual(''); setNuevo(''); setRepetir(''); setOk(true); setMsg(t('pinChanged'))
  }

  return (
    <>
      <Section title={t('myAccount')}>
        <p style={{ fontSize: 14, margin: 0 }}>
          <strong>{runner.name}</strong>
          <span style={{ color: C.gray, marginLeft: 8 }}>{runner.role}</span>
        </p>
      </Section>

      <Section title={t('language')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['en', 'es'] as Lang[]).map(l => (
            <button key={l} onClick={() => onChangeLang(l)} style={{
              flex: 1, padding: 11, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              border: `1px solid ${lang === l ? C.green : C.line}`,
              background: lang === l ? C.green : '#fff', color: lang === l ? '#fff' : C.ink,
            }}>{l === 'en' ? 'English' : 'Español'}</button>
          ))}
        </div>
      </Section>

      <Section title={t('changeMyPin')}>
        <input value={actual} type="password" inputMode="numeric" maxLength={4} placeholder={t('currentPin')}
          onChange={e => setActual(e.target.value.replace(/\D/g, '').slice(0, 4))} style={input} />
        <input value={nuevo} type="password" inputMode="numeric" maxLength={4} placeholder={t('newPin')}
          onChange={e => setNuevo(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
        <input value={repetir} type="password" inputMode="numeric" maxLength={4} placeholder={t('repeatPin')}
          onChange={e => setRepetir(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ ...input, marginTop: 8 }} />
        <button onClick={cambiar} disabled={busy} style={{ ...btn(busy ? C.gray : C.green), marginTop: 12 }}>
          {busy ? t('saving') : t('changeMyPin')}
        </button>
        {msg && <p style={{ fontSize: 13, color: ok ? C.green : C.red, marginBottom: 0 }}>{msg}{ok ? ' ✓' : ''}</p>}
        <p style={{ fontSize: 12, color: C.gray, marginBottom: 0 }}>{t('forgotHint')}</p>
      </Section>

      <button onClick={onLogout} style={{ ...btn(C.red), marginTop: 4 }}>{t('signOut')}</button>
    </>
  )
}
