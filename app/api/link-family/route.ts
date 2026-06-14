import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('profile_type').eq('id', user.id).single()
  const body = await req.json()

  if (body.action === 'generate') {
    if (profile?.profile_type !== 'parent') {
      return NextResponse.json({ error: 'Reserve aux comptes parent' }, { status: 403 })
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const inviteCode = makeCode()
      const { data, error } = await supabase
        .from('family_links')
        .insert({ parent_id: user.id, invite_code: inviteCode, status: 'pending' })
        .select()
        .single()
      if (!error) return NextResponse.json({ invite_code: data.invite_code })
    }
    return NextResponse.json({ error: 'Impossible de generer un code' }, { status: 500 })
  }

  if (body.action === 'claim') {
    if (profile?.profile_type !== 'ado') {
      return NextResponse.json({ error: 'Reserve aux comptes adolescent' }, { status: 403 })
    }
    const code = String(body.invite_code ?? '').trim().toUpperCase()
    const { data, error } = await supabase
      .from('family_links')
      .update({ ado_id: user.id, status: 'active' })
      .eq('invite_code', code)
      .eq('status', 'pending')
      .is('ado_id', null)
      .select()
      .single()
    if (error || !data) return NextResponse.json({ error: 'Code invalide ou deja utilise' }, { status: 404 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
