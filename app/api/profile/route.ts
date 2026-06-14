import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

export async function PATCH(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const allowed = ['name', 'bio', 'location', 'phone', 'avatar_url', 'birth_date',
    'checkin_parental', 'share_mood', 'specialty', 'adeli_number',
    'years_experience', 'age_range', 'consultation_types', 'price_min', 'price_max']
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  const { data, error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email?.split('@')[0],
      profile_type: user.user_metadata?.profile_type ?? 'ado',
      ...patch,
    },
    { onConflict: 'id' }
  ).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, profile: data })
}
