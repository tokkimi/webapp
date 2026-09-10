import { NextRequest, NextResponse } from 'next/server'
import { requirePro, databaseError } from '@/lib/pro-server'

export async function GET(req: NextRequest) {
  const auth = await requirePro(req)
  if (auth.error) return auth.error
  const { data, error } = await auth.supabase.from('pro_practice_settings').select('*').eq('pro_id', auth.user.id).maybeSingle()
  if (error) return databaseError(error)
  return NextResponse.json({ practice: data || { profession: auth.profile.specialty || '', practice_name: auth.profile.name || '', contact_email: auth.profile.email || '', registration_number: '', address: '', phone: '' } }, { headers: { 'Cache-Control': 'no-store' } })
}
export async function PUT(req: NextRequest) {
  const auth = await requirePro(req)
  if (auth.error) return auth.error
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Formulaire invalide.' }, { status: 400 }) }
  const limits = { profession: 120, practice_name: 180, contact_email: 254, registration_number: 100, address: 500, phone: 50 }
  const payload: Record<string, string> = {}
  for (const [field, max] of Object.entries(limits)) {
    if (typeof body?.[field] !== 'string' || body[field].length > max) return NextResponse.json({ error: 'Vérifiez les champs du cabinet.' }, { status: 400 })
    payload[field] = body[field].trim()
  }
  if (!payload.profession || !payload.practice_name) return NextResponse.json({ error: 'La profession et le nom du cabinet sont obligatoires.' }, { status: 400 })
  if (payload.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email)) return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 })
  const { data, error } = await auth.supabase.from('pro_practice_settings').upsert({ ...payload, pro_id: auth.user.id }).select().single()
  if (error) return databaseError(error)
  return NextResponse.json({ practice: data })
}
