import { useState, useEffect, useCallback } from 'react'
import { ITEM_BY_ID, pcsToBoxes, fmt } from '@/lib/data'
import { supabase, ReportRow, SpaceStatusRow, spaceLabel, routeSort } from '@/lib/supabase'
import { C, card, row, btnGhost, sectionLabel, Tab } from '@/lib/ui'
import { useT } from '@/lib/i18n'

export default function Progress() {
  const { t, tUnit, lang } = useT()
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
        <Tab label={t('today')} active={sub === 'hoy'} onClick={() => setSub('hoy')} />
        <Tab label={t('inventory')} active={sub === 'inventario'} onClick={() => setSub('inventario')} />
        <button onClick={load} style={{ ...btnGhost, marginLeft: 'auto' }}>↻</button>
      </div>

      {loading && <p style={{ color: C.gray }}>{t('loading')}</p>}

      {!loading && sub === 'hoy' && (
        <>
          <div style={sectionLabel}>{reports.length} {t('spacesToday')}</div>
          {reports.length === 0 && <p style={{ color: C.gray }}>{t('nothingToday')}</p>}
          {reports.map(r => (
            <div key={r.id} style={{ ...card, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{spaceLabel(r)}</strong>
                <div style={{ fontSize: 12, color: C.gray }}>{r.runner_name} · {r.restock_type}</div>
              </div>
              <span style={{ fontSize: 12, color: C.gray }}>
                {new Date(r.created_at).toLocaleTimeString(lang === 'es' ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </>
      )}

      {!loading && sub === 'inventario' && (
        <>
          <div style={sectionLabel}>{t('islandShort')}</div>
          {Object.keys(totals).length === 0 ? (
            <p style={{ color: C.gray }}>{t('noShortage')}</p>
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
                      <strong style={{ color: C.green }}>{boxes > 0 ? `${boxes} ${boxes > 1 ? t('boxes') : t('box')}` : '—'}</strong>
                      {remainderPcs > 0 && <span style={{ color: C.gray, fontSize: 12, display: 'block' }}>+ {remainderPcs} {t('pcs')}</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={sectionLabel}>{t('levelBySpace')}</div>
          {Object.entries(bySpace).map(([k, rows]) => {
            const faltan = rows.filter(r => r.missing_pcs > 0)
            const head = rows[0]
            return (
              <div key={k} style={{ ...card, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{spaceLabel(head)}</strong>
                  <span style={{ fontSize: 11, color: C.gray }}>
                    {head.updated_by} · {new Date(head.updated_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                {faltan.length === 0 ? (
                  <p style={{ color: C.green, margin: 0, fontSize: 13 }}>{t('complete')}</p>
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

