import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

function unauthorized() {
  return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return unauthorized()

  const body = await req.json()
  const title = String(body.title ?? '').trim()
  if (!title) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      user_id: user.id,
      title,
      description: String(body.description ?? '').trim(),
      category: body.category ?? 'bien-etre',
      target_date: body.target_date || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return unauthorized()

  const body = await req.json()
  const id = String(body.id ?? '')
  if (!id) return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 })

  const { data: current, error: readError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (readError || !current) return NextResponse.json({ error: 'Defi introuvable' }, { status: 404 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.action === 'checkin') {
    const date = new Date().toISOString().slice(0, 10)
    const checkIns = Array.isArray(current.check_ins) ? current.check_ins : []
    if (!checkIns.some((entry: { date?: string }) => entry.date === date)) {
      patch.check_ins = [...checkIns, { date }]
      patch.total_streak = Number(current.total_streak ?? 0) + 1
    }
  } else if (body.action === 'complete') {
    patch.completed = true
    patch.completed_at = new Date().toISOString()
  } else {
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('challenges')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return unauthorized()

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 })

  const { error } = await supabase.from('challenges').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
