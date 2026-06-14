import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { gender, personality, hair, eyes, build, style } = await req.json()
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  // Ensure profile exists
  const { error: profileErr } = await supabase.from('profiles').upsert(
    { id: user.id, email: user.email, name },
    { onConflict: 'id' }
  )
  if (profileErr) {
    return NextResponse.json({ error: `Profile error: ${profileErr.message}` }, { status: 500 })
  }

  const payload = { user_id: user.id, gender, personality, hair: hair ?? null, eyes: eyes ?? null, build: build ?? null, style: style ?? null, updated_at: new Date().toISOString() }
  const { error: configErr } = await supabase.from('ai_config').upsert(payload, { onConflict: 'user_id' })
  if (configErr) return NextResponse.json({ error: `Config error: ${configErr.message}` }, { status: 500 })

  return NextResponse.json({ ok: true })
}
