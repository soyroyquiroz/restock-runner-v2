import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

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
