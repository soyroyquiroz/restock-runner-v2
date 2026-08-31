// Tipos y helpers puros. Sin cliente de base de datos: esto se importa
// tanto en el navegador como en el servidor.

export interface Runner {
  id: string
  name: string
  role: 'runner' | 'supervisor' | 'admin'
  active: boolean
}

export interface ReportRow {
  id: string
  runner_name: string
  entity: string
  lodge_num: number | null
  bridge_num: number | null
  space_name: string | null
  restock_type: string
  created_at: string
}

export interface SpaceStatusRow {
  space_key: string
  item_id: number
  entity: string
  lodge_num: number | null
  bridge_num: number | null
  space_name: string | null
  item_name: string
  steps_present: number
  steps_standard: number
  missing_pcs: number
  updated_by: string | null
  updated_at: string
}

export function spaceKey(entity: string, lodge: number | null, bridge: number | null, space: string | null) {
  return entity === 'outside' ? `o-${lodge}-${bridge}` : `m-${space}`
}

export function spaceLabel(r: { entity: string; lodge_num: number | null; bridge_num: number | null; space_name: string | null }) {
  return r.entity === 'outside' ? `Lodge ${r.lodge_num} · Bridge ${r.bridge_num}` : (r.space_name ?? '—')
}

export interface Trip {
  id: string
  runner_id: string | null
  runner_name: string
  status: 'cargando' | 'entregando' | 'completo'
  created_at: string
  closed_at: string | null
}

export interface TripStop {
  id: string
  trip_id: string
  space_key: string
  entity: string
  lodge_num: number | null
  bridge_num: number | null
  space_name: string | null
  sort_order: number
  delivered_at: string | null
}

export interface TripStopItem {
  id: number
  stop_id: string
  trip_id: string
  item_id: number
  item_name: string
  units: number
  steps_standard: number
  pcs: number
  delivered: boolean
}

export interface TripLoadItem {
  id: number
  trip_id: string
  item_id: number
  item_name: string
  total_pcs: number
  boxes: number
  remainder_pcs: number
  loaded: boolean
}

// Orden fijo de la ruta: por lodge, luego por número de bridge; Main al final.
export function routeSort(a: { entity: string; lodge_num: number | null; bridge_num: number | null; space_name: string | null },
                          b: { entity: string; lodge_num: number | null; bridge_num: number | null; space_name: string | null }) {
  if (a.entity !== b.entity) return a.entity === 'outside' ? -1 : 1
  if (a.entity === 'outside') {
    if ((a.lodge_num ?? 0) !== (b.lodge_num ?? 0)) return (a.lodge_num ?? 0) - (b.lodge_num ?? 0)
    return (a.bridge_num ?? 0) - (b.bridge_num ?? 0)
  }
  return (a.space_name ?? '').localeCompare(b.space_name ?? '')
}
