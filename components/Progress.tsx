import { useState, useEffect, useCallback } from 'react'
import { ITEM_BY_ID, pcsToBoxes, fmt } from '@/lib/data'
import { ReportRow, SpaceStatusRow, Runner, spaceLabel, routeSort } from '@/lib/types'
import { api } from '@/lib/api'
import { C, card, row, btnGhost, sectionLabel, Tab } from '@/lib/ui'

export default function Progress({ runner }: { runner: Runner }) {
  const [sub, setSub] = useState<'hoy' | 'inventario'>('hoy')
  const [reports, setReports] = useState<ReportRow[]>([])
  const [status, setStatus] = useState<SpaceStatusRow[]>([])
  const [scope, setScope] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/progress')
      setReports(r.reports); setStatus(r.status); setScope(r.scope)
    } catch {}
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const totals: Record<number, number> = {}
  status.forEach(s => { if (s.missing_pcs > 0) totals[s.item_id] = (totals[s.item_id] || 0) + s.missing_pcs })

  const bySpace = Object.values(
    status.reduce((acc: Record<string, SpaceStatusRow[]>, s) => { (acc[s.space_key] ||= []).push(s); return acc }, {})
  ).sort((a, b) => routeSort(a[0], b[0]))

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
          <div style={sectionLabel}>
            {reports.length} espacio{reports.length === 1 ? '' : 's'} hoy
            {scope === 'propio' && ' · solo tu actividad'}
          </div>
          {reports.length === 0 && <p style={{ color: C.gray }}>Nada capturado hoy.</p>}
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
          <div style={sectionLabel}>Faltante actual de toda la isla</div>
          {Object.keys(totals).length === 0 ? <p style={{ color: C.gray }}>Sin faltantes.</p> : (
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
          {bySpace.map(rows => {
            const head = rows[0]
            const faltan = rows.filter(r => r.missing_pcs > 0)
            return (
              <div key={head.space_key} style={{ ...card, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{spaceLabel(head)}</strong>
                  <span style={{ fontSize: 11, color: C.gray }}>{head.updated_by}</span>
                </div>
                {faltan.length === 0 ? <p style={{ color: C.green, margin: 0, fontSize: 13 }}>Completo</p> :
                  faltan.map(r => (
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
