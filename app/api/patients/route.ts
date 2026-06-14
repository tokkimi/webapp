import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

async function getPro(req: NextRequest) {
  const auth = await getAuthenticatedClient(req)
  if (!auth.user) return { ...auth, allowed: false }
  const { data } = await auth.supabase.from('profiles').select('profile_type').eq('id', auth.user.id).single()
  return { ...auth, allowed: data?.profile_type === 'pro' }
}

export async function GET(req: NextRequest) {
  const { user, supabase, allowed } = await getPro(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Reserve aux professionnels' }, { status: 403 })

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id,patient_id,scheduled_at,duration_minutes,type,status,notes_for_pro,pro_notes,patient:profiles!appointments_patient_id_fkey(id,name,email,phone,avatar_url,birth_date)')
    .eq('pro_id', user.id)
    .order('scheduled_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const patientIds = [...new Set((appointments ?? []).map((a: any) => a.patient_id))]
  const { data: resources } = await supabase
    .from('resources')
    .select('id,title,description,url,type,category')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const patients = patientIds.map(patientId => {
    const sessions = (appointments ?? []).filter((a: any) => a.patient_id === patientId)
    return {
      ...(sessions[0] as any).patient,
      appointments: sessions,
      note: sessions.find((appointment: any) => appointment.pro_notes)?.pro_notes ?? '',
    }
  })
  return NextResponse.json({ patients, resources: resources ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, supabase, allowed } = await getPro(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Reserve aux professionnels' }, { status: 403 })
  const body = await req.json()
  const patientId = String(body.patient_id ?? '')

  if (body.action === 'note') {
    const { data: latest } = await supabase.from('appointments')
      .select('id').eq('pro_id', user.id).eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false }).limit(1).single()
    if (!latest) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    const { data, error } = await supabase.from('appointments')
      .update({ pro_notes: String(body.content ?? '') }).eq('id', latest.id).select().single()
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
  }
  if (body.action === 'share') {
    const { data: resource } = await supabase.from('resources')
      .select('title,url').eq('id', body.resource_id).eq('approved', true).single()
    const { data: appointment } = await supabase.from('appointments')
      .select('id').eq('pro_id', user.id).eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false }).limit(1).single()
    if (!resource || !appointment) return NextResponse.json({ error: 'Ressource ou client introuvable' }, { status: 404 })
    const { data: conversation } = await supabase.from('conversations')
      .select('id').eq('appointment_id', appointment.id).single()
    if (!conversation) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    const content = `Ressource partagee : ${resource.title}${resource.url ? ` - ${resource.url}` : ''}`
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id, sender_id: user.id, content,
    })
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
