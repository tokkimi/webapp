import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

const NOTES_PREFIX = 'CAPSULE_NOTES_V1:'

type ClinicalNote = {
  id: string
  content: string
  created_at: string
  updated_at: string
}

function parseClinicalNotes(value: unknown, appointmentId: string, scheduledAt: string): ClinicalNote[] {
  const content = typeof value === 'string' ? value.trim() : ''
  if (!content) return []

  if (content.startsWith(NOTES_PREFIX)) {
    try {
      const notes = JSON.parse(content.slice(NOTES_PREFIX.length))
      if (Array.isArray(notes)) return notes
    } catch {
      // Keep the legacy value visible if stored data is malformed.
    }
  }

  return [{
    id: `legacy-${appointmentId}`,
    content,
    created_at: scheduledAt,
    updated_at: scheduledAt,
  }]
}

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

  const patients = await Promise.all(patientIds.map(async patientId => {
    const sessions = (appointments ?? [])
      .filter((a: any) => a.patient_id === patientId)
      .map((appointment: any) => ({
        ...appointment,
        clinical_notes: parseClinicalNotes(
          appointment.pro_notes,
          appointment.id,
          appointment.scheduled_at
        ),
      }))
    const appointmentIds = sessions.map((appointment: any) => appointment.id)
    let sharedResources: any[] = []
    if (appointmentIds.length) {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .in('appointment_id', appointmentIds)
      const conversationIds = (conversations ?? []).map((conversation: any) => conversation.id)
      if (conversationIds.length) {
        const { data: messages } = await supabase
          .from('messages')
          .select('id,content,created_at')
          .in('conversation_id', conversationIds)
          .eq('sender_id', user.id)
          .like('content', 'Ressource partagee :%')
          .order('created_at', { ascending: false })
        sharedResources = (messages ?? []).map((message: any) => {
          const value = String(message.content).replace(/^Ressource partagee :\s*/, '')
          const separator = value.lastIndexOf(' - http')
          return {
            id: message.id,
            title: separator >= 0 ? value.slice(0, separator) : value,
            url: separator >= 0 ? value.slice(separator + 3) : null,
            shared_at: message.created_at,
          }
        })
      }
    }
    return {
      ...(sessions[0] as any).patient,
      appointments: sessions,
      note: sessions.find((appointment: any) => appointment.pro_notes)?.pro_notes ?? '',
      shared_resources: sharedResources,
    }
  }))
  return NextResponse.json({ patients, resources: resources ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, supabase, allowed } = await getPro(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Reserve aux professionnels' }, { status: 403 })
  const body = await req.json()
  const patientId = String(body.patient_id ?? '')

  if (body.action === 'note') {
    const appointmentId = String(body.appointment_id ?? '')
    const { data: appointment } = await supabase.from('appointments')
      .select('id,scheduled_at,pro_notes')
      .eq('id', appointmentId)
      .eq('pro_id', user.id)
      .eq('patient_id', patientId)
      .single()
    if (!appointment) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 })
    const content = String(body.content ?? '').trim()
    if (!content) return NextResponse.json({ error: 'La note ne peut pas être vide.' }, { status: 400 })

    const notes = parseClinicalNotes(appointment.pro_notes, appointment.id, appointment.scheduled_at)
    const requestedId = String(body.note_id ?? '')
    const existingIndex = notes.findIndex(note => note.id === requestedId)
    const now = new Date().toISOString()
    let savedNoteId = requestedId

    if (existingIndex >= 0) {
      notes[existingIndex] = { ...notes[existingIndex], content, updated_at: now }
    } else {
      savedNoteId = crypto.randomUUID()
      notes.unshift({ id: savedNoteId, content, created_at: now, updated_at: now })
    }

    const { error } = await supabase.from('appointments')
      .update({ pro_notes: `${NOTES_PREFIX}${JSON.stringify(notes)}` })
      .eq('id', appointment.id)
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ notes, saved_note_id: savedNoteId })
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
