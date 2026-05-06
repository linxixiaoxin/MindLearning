import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...init.headers,
    },
  })
}

export async function authenticateRequest(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: jsonResponse({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { user: null, error: jsonResponse({ error: 'Server configuration error' }, { status: 500 }) }
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return { user: null, error: jsonResponse({ error: 'Invalid token' }, { status: 401 }) }
  }

  return { user, error: null }
}

export async function requireAdmin(request) {
  const { user, error } = await authenticateRequest(request)
  if (error) return { user: null, error }

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { user: null, error: jsonResponse({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, error: null }
}
