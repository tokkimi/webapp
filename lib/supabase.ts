import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
let browserClient: SupabaseClient<any> | null = null

export function createSupabaseClient() {
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'capsule_auth' } })
}

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'capsule_auth' },
    })
  }
  return browserClient
}
