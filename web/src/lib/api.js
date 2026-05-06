import { getSupabaseClient } from './auth.js'

export async function apiCall(path, options = {}) {
  const supabase = getSupabaseClient()
  let token = null
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${response.status}`)
  }

  return response.json()
}
