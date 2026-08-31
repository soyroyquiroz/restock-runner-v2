// Cliente del navegador. Habla SOLO con nuestras rutas de API,
// nunca directo con Supabase.
async function call(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`)
  return body
}

export const api = {
  get: (path: string) => call(path),
  post: (path: string, data?: unknown) => call(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  patch: (path: string, data?: unknown) => call(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
}
