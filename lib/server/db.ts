import { createClient } from '@supabase/supabase-js'

// Cliente de servidor. Usa la service role key, que NUNCA sale al navegador
// (no lleva prefijo NEXT_PUBLIC_). Ignora RLS a propósito: los permisos se
// aplican en las rutas de API, no en el cliente.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (typeof window !== 'undefined') {
  throw new Error('lib/server/db solo puede importarse desde el servidor')
}

export const MISSING_ENV = !serviceKey
  ? 'Falta la variable SUPABASE_SERVICE_ROLE_KEY en el entorno'
  : !process.env.SESSION_SECRET
  ? 'Falta la variable SESSION_SECRET en el entorno'
  : null

export const db = createClient(url, serviceKey ?? 'sin-configurar', {
  auth: { persistSession: false, autoRefreshToken: false },
})
