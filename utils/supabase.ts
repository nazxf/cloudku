/**
 * Supabase Client for CloudKu
 * 
 * This client is used for Supabase features like:
 * - Authentication (Supabase Auth)
 * - Realtime subscriptions
 * - Storage (optional)
 * 
 * The Golang backend is still used for:
 * - File Manager operations
 * - Domain management
 * - SSL/DNS management
 * - Database administration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure for client-side apps
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ==========================================
// Auth Helper Functions
// ==========================================

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// ==========================================
// Realtime Helper Functions
// ==========================================

/**
 * Subscribe to table changes
 */
export function subscribeToTable(
  tableName: string, 
  callback: (payload: any) => void
) {
  return supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tableName }, 
      callback
    )
    .subscribe()
}

/**
 * Subscribe to a specific channel for broadcast messages
 */
export function subscribeToChannel(
  channelName: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(channelName)
    .on('broadcast', { event: '*' }, callback)
    .subscribe()
}

// Export default client
export default supabase
