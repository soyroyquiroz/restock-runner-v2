import { useState, useEffect, useCallback } from 'react'
import { ITEMS, getStandard, pcsBoxOf, loadOverrides, Item, Entity } from '@/lib/data'
import { supabase, Runner } from '@/lib/supabase'
import { C, card, btn, btnGhost, input, sectionLabel, Section } from '@/lib/ui'
import { useT } from '@/lib/i18n'

// Editor del catálogo. Solo admin. Cambia proporciones sin tocar código.
export default function Catalogo({ runner }: { runner: Runner }) {
  const { t, tUnit } = useT()
  const [abierto, setAbierto] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [tick, setTick] = useState(0)

  const recargar = useCallback(async () => {
    const { data } = await supabase.from('item_overrides').select('item_id,scope,steps,pcs_per_step,pcs_box')
    if (data) loadOverrides(data as any)
    setTick(t => t + 1)
  }, [])
  useEffect(() => { recargar() }, [recargar])

  async function guardar(itemId: number, scope: string, campos: Record<string, number | null>) {
    setMsg('')
    const { error } = await supabase.from('item_overrides').upsert({
      item_id: itemId, scope, ...campos,
      updated_by: runner.name, updated_at: new Date().toISOString(),
    }, { onConflict: 'item_id,scope' })
    if (error) return setMsg(error.message)
    await recargar()
    setMsg(t('saved') + ' ✓')
  }

  async function restaurar(itemId: number) {
    if (!confirm(t('confirmRestore'))) return
    await supabase.from('item_overrides').delete().eq('item_id', itemId)
    await recargar()
    setMsg(t('restored') + ' ✓')
  }

  if (runner.role !== 'admin') {
    return <p style={{ color: C.gray }}>{t('adminOnly')}</p>
  }

  return (
    <>
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={sectionLabel}>{t('tabCatalog')}</div>
        <p style={{ fontSize: 13, color: C.gray, margin: 0 }}>
{t('catalogHelp')}
        </p>
      </div>

      {ITEMS.map(item => {
        const abierta = abierto === item.id
        const out = getStandard(item, 'outside', null)
        const main = getStandard(item, 'main', 'Piso 2')
        return (
          <div key={item.id} style={{ ...card, marginBottom: 8 }} data-tick={tick}>
            <button onClick={() => setAbierto(abierta ? null : item.id)}
              style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 15 }}>
              <strong>{item.es}</strong>
              <span style={{ color: C.gray, fontSize: 13 }}>{pcsBoxOf(item)} {t('pcsBoxShort')} {abierta ? '▾' : '▸'}</span>
            </button>

            {abierta && (
              <div style={{ marginTop: 12 }}>
                <Campo label={t('pcsPerBox')} valor={pcsBoxOf(item)}
                  onGuardar={v => guardar(item.id, 'box', { pcs_box: v, steps: null, pcs_per_step: null })} />

                {out && <Bloque titulo={t('bridgesLabel')} std={out} item={item} entity="outside" onGuardar={guardar} />}
                {main && <Bloque titulo={t('mainLabel')} std={main} item={item} entity="main" onGuardar={guardar} />}

                <button onClick={() => restaurar(item.id)} style={{ ...btnGhost, marginTop: 10, color: C.red }}>
                  Restaurar valores originales
                </button>
              </div>
            )}
          </div>
        )
      })}

      {msg && <p style={{ fontSize: 13, color: msg.endsWith('✓') ? C.green : C.red }}>{msg}</p>}
    </>
  )
}

function Bloque({ titulo, std, item, entity, onGuardar }: {
  titulo: string; std: any; item: Item; entity: Entity
  onGuardar: (id: number, scope: string, campos: Record<string, number | null>) => void
}) {
  const { t, tUnit } = useT()
  const [steps, setSteps] = useState(String(std.steps))
  const [pps, setPps] = useState(String(std.pcsPerStep))

  useEffect(() => { setSteps(String(std.steps)); setPps(String(std.pcsPerStep)) }, [std.steps, std.pcsPerStep])

  const total = (Number(steps) || 0) * (Number(pps) || 0)

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, marginTop: 10 }}>
      <div style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>{titulo}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ flex: 1, fontSize: 12, color: C.gray }}>
          {tUnit(std.unitPlural)} {t('at100')}
          <input value={steps} inputMode="decimal" onChange={e => setSteps(e.target.value)} style={{ ...input, marginTop: 4 }} />
        </label>
        <label style={{ flex: 1, fontSize: 12, color: C.gray }}>
          {t('pcsPer')} {tUnit(std.unit)}
          <input value={pps} inputMode="decimal" onChange={e => setPps(e.target.value)} style={{ ...input, marginTop: 4 }} />
        </label>
      </div>
      <p style={{ fontSize: 12, color: C.gray, margin: '6px 0 0' }}>
        {t('fullStandard')} <strong>{total} {t('pcs')}</strong> {t('perSpace')}
      </p>
      <button
        onClick={() => onGuardar(item.id, entity, { steps: Number(steps), pcs_per_step: Number(pps), pcs_box: null })}
        style={{ ...btn(C.green), marginTop: 8, padding: 9, fontSize: 14 }}>
        {t('save')}
      </button>
    </div>
  )
}

function Campo({ label, valor, onGuardar }: { label: string; valor: number; onGuardar: (v: number) => void }) {
  const [v, setV] = useState(String(valor))
  useEffect(() => { setV(String(valor)) }, [valor])
  return (
    <div>
      <label style={{ fontSize: 12, color: C.gray }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input value={v} inputMode="numeric" onChange={e => setV(e.target.value)} style={input} />
        <button onClick={() => onGuardar(Number(v))} style={{ ...btn(C.green), width: 'auto', padding: '0 16px', fontSize: 14 }}>OK</button>
      </div>
    </div>
  )
}
