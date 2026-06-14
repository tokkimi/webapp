import { NextRequest } from 'next/server'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getAuthenticatedClient(req: NextRequest): Promise<{
  user: User | null
  supabase: SupabaseClient<any>
}> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  const supabase = createClient<any>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  })

  if (!token) return { user: null, supabase }

  const { data } = await supabase.auth.getUser(token)
  return { user: data.user ?? null, supabase }
}
