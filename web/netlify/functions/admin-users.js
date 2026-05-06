import { getSupabaseAdmin, jsonResponse, requireAdmin } from './_supabase.js'

export default async function adminUsers(request) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  const supabase = getSupabaseAdmin()
  const method = request.method

  if (method === 'GET') {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return jsonResponse({ error: error.message }, { status: 500 })
    return jsonResponse({ users: profiles })
  }

  if (method === 'PATCH') {
    let body
    try { body = await request.json() } catch {
      return jsonResponse({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { userId, role } = body
    if (!userId || !['user', 'admin'].includes(role)) {
      return jsonResponse({ error: 'Invalid userId or role' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) return jsonResponse({ error: error.message }, { status: 500 })
    return jsonResponse({ ok: true })
  }

  if (method === 'DELETE') {
    let body
    try { body = await request.json() } catch {
      return jsonResponse({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { userId } = body
    if (!userId) {
      return jsonResponse({ error: 'userId is required' }, { status: 400 })
    }

    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) return jsonResponse({ error: error.message }, { status: 500 })

    return jsonResponse({ ok: true })
  }

  return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
}
