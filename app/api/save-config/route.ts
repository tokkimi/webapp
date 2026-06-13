import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get the user's JWT from the Authorization header
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 })

  // Use service role if available (bypasses RLS), otherwise use user token
  const supabase = serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    : createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      })

  // Verify the user token to get their ID
  const verifyClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: authErr } = await verifyClient.auth.getUser()
  if (!user) return NextResponse.json({ error: `Auth failed: ${authErr?.message}` }, { status: 401 })

  const body = await req.json()
  const { gender, personality, hair, eyes, build, style } = body

  // Upsert profile
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const { error: profileErr } = await supabase.from('profiles').upsert(
    { id: user.id, email: user.email, name },
    { onConflict: 'id' }
  )
  if (profileErr) {
    console.error('profile upsert error:', profileErr)
    return NextResponse.json({ error: `Profile error: ${profileErr.message}` }, { status: 500 })
  }

  // Insert or update ai_config
  const { data: existing } = await supabase.from('ai_config').select('id').eq('user_id', user.id).single()
  const payload = { user_id: user.id, gender, personality, hair, eyes, build, style, updated_at: new Date().toISOString() }
  const { error: configErr } = existing
    ? await supabase.from('ai_config').update(payload).eq('user_id', user.id)
    : await supabase.from('ai_config').insert(payload)
  if (configErr) {
    console.error('ai_config save error:', configErr)
    return NextResponse.json({ error: `Config error: ${configErr.message}` }, { status: 500 })
  }

  // Verify it was actually saved
  const { data: verify } = await supabase.from('ai_config').select('id').eq('user_id', user.id).single()
  if (!verify) {
    return NextResponse.json({ error: 'Config was not saved (RLS or constraint issue)' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
