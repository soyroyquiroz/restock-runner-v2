import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Tables = {
  users: { id: string; email: string; name: string; role: string }
  items: { id: number; name_es: string; name_en: string; req_outside: number; pcs_box: number }
  reports: { id: string; user_id: string; entity: string; item_fill_data: Record<number, number> }
}
