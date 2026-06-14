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

  // A profile edit must never change the account role. In particular, older
  // accounts may not have profile_type in auth metadata even though their
  // database profile is a professional or parent account.
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, profile: data })
}
