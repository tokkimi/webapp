import { NextRequest, NextResponse } from 'next/server'
import { requirePro, databaseError } from '@/lib/pro-server'
import { dateIsValid, validateEntry } from '@/lib/pro-finance'

export async function GET(req: NextRequest) {
  const auth = await requirePro(req)
  if (auth.error) return auth.error
  const from = req.nextUrl.searchParams.get('from'), to = req.nextUrl.searchParams.get('to')
  if (!dateIsValid(from) || !dateIsValid(to) || from > to) return NextResponse.json({ error: 'Choisissez une période valide.' }, { status: 400 })
  // Page explicitly: Supabase's default row cap must not truncate exported totals.
  const entries: any[] = []
  for (let offset = 0; offset <= 10000; offset += 500) {
    const { data, error } = await auth.supabase.from('pro_finance_entries').select('*').eq('pro_id', auth.user.id).gte('report_date', from).lte('report_date', to).order('report_date', { ascending: false }).order('id').range(offset, offset + 499)
    if (error) return databaseError(error)
    entries.push(...(data || []))
    if (entries.length > 10000) return NextResponse.json({ error: 'Cette période dépasse 10 000 opérations. Choisissez une période plus courte pour obtenir un export complet.' }, { status: 422 })
    if ((data?.length || 0) < 500) break
  }
  return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'no-store' } })
}
export async function POST(req: NextRequest) {
  const auth = await requirePro(req)
  if (auth.error) return auth.error
  let body, payload
  try { body = await req.json(); payload = validateEntry(body, auth.user.id) } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Opération invalide.' }, { status: 400 }) }
  if (typeof body.id !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.id)) return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 })
  const { data, error } = await auth.supabase.from('pro_finance_entries').insert({ ...payload, pro_id: auth.user.id, id: body.id }).select().single()
  if (error?.code === '23505') return NextResponse.json({ error: 'Cette opération est déjà enregistrée. Rechargez la liste avant de réessayer.' }, { status: 409 })
  if (error) return databaseError(error)
  return NextResponse.json({ entry: data }, { status: 201 })
}
export async function PATCH(req: NextRequest) {
  const auth = await requirePro(req)
  if (auth.error) return auth.error
  let body, payload
  try { body = await req.json(); payload = validateEntry(body, auth.user.id) } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Opération invalide.' }, { status: 400 }) }
  if (typeof body.id !== 'string' || typeof body.updated_at !== 'string') return NextResponse.json({ error: 'Version manquante. Rechargez la liste.' }, { status: 400 })
  const { data, error } = await auth.supabase.from('pro_finance_entries').update(payload).eq('id', body.id).eq('pro_id', auth.user.id).eq('updated_at', body.updated_at).select().maybeSingle()
  if (error) return databaseError(error)
  if (!data) return NextResponse.json({ error: 'Cette opération a été modifiée ailleurs. Rechargez la liste pour éviter de remplacer une modification.' }, { status: 409 })
  return NextResponse.json({ entry: data })
}
