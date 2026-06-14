import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

export async function GET(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return jsonError('Non authentifie', 401)

  const url = new URL(req.url)
  if (url.searchParams.get('resource') === 'slots') {
    const proId = url.searchParams.get('pro')
    let query = supabase
      .from('availability_slots')
      .select('*')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
    if (proId) query = query.eq('pro_id', proId).eq('is_booked', false)
    else query = query.eq('pro_id', user.id)
    const { data, error } = await query
    if (error) return jsonError(error.message, 500)
    return NextResponse.json(data ?? [])
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('profile_type')
    .eq('id', user.id)
    .single()
  const profile = profileData as { profile_type?: string } | null
  const relation = profile?.profile_type === 'pro' ? 'patient' : 'pro'
  const foreignKey = profile?.profile_type === 'pro'
    ? 'appointments_patient_id_fkey'
    : 'appointments_pro_id_fkey'

  const { data, error } = await supabase
    .from('appointments')
    .select(`*, ${relation}:profiles!${foreignKey}(id,name,avatar_url,specialty)`)
    .order('scheduled_at', { ascending: true })

  if (error) return jsonError(error.message, 500)
  return NextResponse.json({ role: profile?.profile_type ?? 'ado', appointments: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return jsonError('Non authentifie', 401)
  const body = await req.json()

  if (body.action === 'slot') {
    const { data: profileData } = await supabase.from('profiles').select('profile_type').eq('id', user.id).single()
    const profile = profileData as { profile_type?: string } | null
    if (profile?.profile_type !== 'pro') return jsonError('Reserve aux professionnels', 403)
    const startsAt = new Date(body.starts_at)
    const endsAt = new Date(startsAt.getTime() + Number(body.duration_minutes ?? 50) * 60000)
    if (!Number.isFinite(startsAt.getTime()) || startsAt <= new Date()) return jsonError('Date invalide')
    const { data, error } = await supabase
      .from('availability_slots')
      .insert({ pro_id: user.id, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
      .select()
      .single()
    if (error) return jsonError(error.message, 500)
    return NextResponse.json(data, { status: 201 })
  }

  const { data, error } = await supabase.rpc('book_appointment', {
    requested_slot: body.slot_id,
    requested_type: body.type ?? 'video',
    requested_notes: body.notes ?? null,
  })
  if (error) return jsonError(error.message, 409)
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return jsonError('Non authentifie', 401)
  const body = await req.json()
  const allowed = ['confirmed', 'cancelled', 'completed']
  if (!body.id || !allowed.includes(body.status)) return jsonError('Statut invalide')

  const { data: appointment } = await supabase
    .from('appointments')
    .select('patient_id,pro_id,status,availability_slot_id')
    .eq('id', body.id)
    .single()
  if (!appointment || ![appointment.patient_id, appointment.pro_id].includes(user.id)) {
    return jsonError('Rendez-vous introuvable', 404)
  }
  if (body.status === 'confirmed' && appointment.pro_id !== user.id) {
    return jsonError('Seul le professionnel peut confirmer', 403)
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: body.status })
    .eq('id', body.id)
    .select()
    .single()
  if (error) return jsonError(error.message, 500)

  if (body.status === 'cancelled' && appointment.availability_slot_id) {
    await supabase
      .from('availability_slots')
      .update({ is_booked: false })
      .eq('id', appointment.availability_slot_id)
  }
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return jsonError('Non authentifie', 401)
  const id = new URL(req.url).searchParams.get('slot')
  if (!id) return jsonError('Creneau requis')
  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', id)
    .eq('pro_id', user.id)
    .eq('is_booked', false)
  if (error) return jsonError(error.message, 500)
  return NextResponse.json({ ok: true })
}
