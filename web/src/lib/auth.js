import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
let globalSearchPromise = null

const user = ref(null)
const session = ref(null)
const profile = ref(null)
const loading = ref(true)

export function getSupabaseClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not configured. Auth disabled.')
      return null
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

export function useAuth() {
  const client = getSupabaseClient()

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function loadProfile(userId) {
    if (!client) return
    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    profile.value = data || null
  }

  async function initAuth() {
    if (!client) {
      loading.value = false
      return
    }

    const { data: { session: existingSession } } = await client.auth.getSession()
    session.value = existingSession
    user.value = existingSession?.user ?? null

    client.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      if (user.value) {
        await loadProfile(user.value.id)
      } else {
        profile.value = null
      }
    })

    if (user.value) {
      await loadProfile(user.value.id)
    }

    loading.value = false
  }

  async function signIn(email, password) {
    if (!client) throw new Error('Auth not configured')
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password) {
    if (!client) throw new Error('Auth not configured')
    const { error } = await client.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signOut() {
    if (!client) return
    await client.auth.signOut()
    user.value = null
    session.value = null
    profile.value = null
  }

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    initAuth,
    signIn,
    signUp,
    signOut,
    loadProfile,
  }
}
