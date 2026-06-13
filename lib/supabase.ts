import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createSupabaseClient() {
  return createClient(url, key)
}

export function createSupabaseBrowserClient() {
  return createClient(url, key)
}
