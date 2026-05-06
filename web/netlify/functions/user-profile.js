import { getSupabaseAdmin, jsonResponse, authenticateRequest } from './_supabase.js'

export default async function userProfile(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  const { user, error } = await authenticateRequest(request)
  if (error) return error

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return jsonResponse({ profile: { ...(profile || {}), email: user.email } })
}
