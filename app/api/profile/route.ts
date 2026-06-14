import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function PATCH(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')

  // Identify user from their session token
  const anonClient = createClient(url, anonKey, { auth: { persistSession: false } })
  let user: any = null

  if (token) {
    const { data } = await anonClient.auth.getUser(token)
    user = data?.user
  }

  // Fallback: try cookie-based session
  if (!user) {
    const { data } = await anonClient.auth.getUser()
    user = data?.user
  }

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const allowed = ['name', 'bio', 'location', 'phone', 'avatar_url', 'birth_date',
    'checkin_parental', 'share_mood', 'specialty', 'adeli_number',
    'years_experience', 'age_range', 'consultation_types', 'price_min', 'price_max']
  const patch: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  // Use service role if available (bypasses RLS), otherwise use user's token
  const db = serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // Upsert so it works even if the row doesn't exist yet
  const { error } = await db.from('profiles').upsert(
    { id: user.id, email: user.email, ...patch },
    { onConflict: 'id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
