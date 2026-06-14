import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/server-supabase'

export async function DELETE(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  const { error } = await supabase.rpc('delete_own_account')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
