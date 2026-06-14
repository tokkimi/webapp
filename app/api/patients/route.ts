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
    .select('id,patient_id,scheduled_at,duration_minutes,type,status,notes_for_pro,patient:profiles!appointments_patient_id_fkey(id,name,email,phone,avatar_url,birth_date)')
    .eq('pro_id', user.id)
    .order('scheduled_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const patientIds = [...new Set((appointments ?? []).map((a: any) => a.patient_id))]
  const [{ data: notes }, { data: shares }, { data: resources }] = await Promise.all([
    patientIds.length ? supabase.from('clinical_notes').select('*').eq('pro_id', user.id).in('patient_id', patientIds) : Promise.resolve({ data: [] }),
    patientIds.length ? supabase.from('patient_resources').select('*').eq('pro_id', user.id).in('patient_id', patientIds) : Promise.resolve({ data: [] }),
    supabase.from('resources').select('id,title,description,url,type,category').eq('approved', true).order('created_at', { ascending: false }),
  ])

  const patients = patientIds.map(patientId => {
    const sessions = (appointments ?? []).filter((a: any) => a.patient_id === patientId)
    return {
      ...(sessions[0] as any).patient,
      appointments: sessions,
      note: (notes ?? []).find((n: any) => n.patient_id === patientId) ?? null,
      resource_ids: (shares ?? []).filter((s: any) => s.patient_id === patientId).map((s: any) => s.resource_id),
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
    const { data, error } = await supabase.from('clinical_notes').upsert(
      { pro_id: user.id, patient_id: patientId, content: String(body.content ?? ''), updated_at: new Date().toISOString() },
      { onConflict: 'pro_id,patient_id' }
    ).select().single()
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
  }
  if (body.action === 'share') {
    const { error } = await supabase.from('patient_resources').upsert(
      { pro_id: user.id, patient_id: patientId, resource_id: body.resource_id },
      { onConflict: 'pro_id,patient_id,resource_id' }
    )
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
