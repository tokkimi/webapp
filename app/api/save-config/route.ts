import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set on server' }, { status: 500 })
  }

  // Verify user identity via their JWT
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 })

  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token)
  if (!user) return NextResponse.json({ error: `Auth failed: ${authErr?.message ?? 'invalid token'}` }, { status: 401 })

  // Admin client bypasses RLS entirely
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { gender, personality, hair, eyes, build, style } = await req.json()
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  // Ensure profile exists
  const { error: profileErr } = await admin.from('profiles').upsert(
    { id: user.id, email: user.email, name },
    { onConflict: 'id' }
  )
  if (profileErr) {
    return NextResponse.json({ error: `Profile error: ${profileErr.message}` }, { status: 500 })
  }

  // Delete any duplicate ai_config rows, keep only the most recent
  const { data: allRows } = await admin.from('ai_config').select('id').eq('user_id', user.id).order('updated_at', { ascending: false })
  if (allRows && allRows.length > 1) {
    const idsToDelete = allRows.slice(1).map((r: any) => r.id)
    await admin.from('ai_config').delete().in('id', idsToDelete)
  }

  const payload = { user_id: user.id, gender, personality, hair: hair ?? null, eyes: eyes ?? null, build: build ?? null, style: style ?? null, updated_at: new Date().toISOString() }

  if (allRows && allRows.length >= 1) {
    // Update existing row
    const { error: configErr } = await admin.from('ai_config').update(payload).eq('id', allRows[0].id)
    if (configErr) return NextResponse.json({ error: `Update error: ${configErr.message}` }, { status: 500 })
  } else {
    // Insert new row
    const { error: configErr } = await admin.from('ai_config').insert(payload)
    if (configErr) return NextResponse.json({ error: `Insert error: ${configErr.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
