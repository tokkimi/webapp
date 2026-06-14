import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const path = String(body.path || '').slice(0, 500)
  if (!path.startsWith('/')) return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { error } = await supabase.from('page_visits').insert({
    path,
    session_id: String(body.session_id || '').slice(0, 100) || null,
    referrer: body.referrer ? String(body.referrer).slice(0, 1000) : null,
    user_agent: req.headers.get('user-agent'),
  })
  if (error && error.code !== '42P01') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
