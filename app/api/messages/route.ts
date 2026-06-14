import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

export async function GET(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const conversationId = new URL(req.url).searchParams.get('conversation')
  if (conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*,sender:profiles!messages_sender_id_fkey(id,name,avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  const { data: memberships, error } = await supabase
    .from('conversation_members')
    .select('conversation_id,conversation:conversations(id,appointment_id,updated_at)')
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const conversations = await Promise.all((memberships ?? []).map(async (membership: any) => {
    const { data: members } = await supabase
      .from('conversation_members')
      .select('user_id,profile:profiles(id,name,avatar_url,profile_type,specialty)')
      .eq('conversation_id', membership.conversation_id)
      .neq('user_id', user.id)
    const { data: latest } = await supabase
      .from('messages')
      .select('content,created_at')
      .eq('conversation_id', membership.conversation_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return {
      id: membership.conversation_id,
      appointment_id: membership.conversation?.appointment_id,
      updated_at: latest?.created_at ?? membership.conversation?.updated_at,
      contact: members?.[0]?.profile ?? null,
      latest,
    }
  }))

  return NextResponse.json(conversations.sort((a, b) =>
    String(b.updated_at).localeCompare(String(a.updated_at))
  ))
}

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  const body = await req.json()
  const content = String(body.content ?? '').trim()
  if (!body.conversation_id || !content) {
    return NextResponse.json({ error: 'Message requis' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: body.conversation_id, sender_id: user.id, content })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', body.conversation_id)
  return NextResponse.json(data, { status: 201 })
}
