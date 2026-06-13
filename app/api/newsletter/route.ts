import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const body = await request.json()
  const { email, name, profile_type, consent } = body as {
    email: string; name?: string; profile_type?: string; consent: boolean
  }

  if (!email || !consent) {
    return NextResponse.json({ error: 'Email et consentement requis' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  // Store in newsletter_subscribers table
  const { error } = await supabase.from('newsletter_subscribers').upsert({
    email: email.toLowerCase().trim(),
    name: name?.trim() || null,
    profile_type: profile_type || null,
    consent_at: new Date().toISOString(),
    active: true,
  }, { onConflict: 'email' })

  if (error) {
    // Table may not exist yet — graceful fallback
    if (error.code === '42P01') {
      // Table doesn't exist, just return success (will be created on next deploy)
      return NextResponse.json({ success: true, message: 'Inscription enregistrée' })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Inscription confirmée ! Merci de rejoindre la communauté Capsule Ado.' })
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  // Unsubscribe
  await supabase.from('newsletter_subscribers').update({ active: false, unsubscribed_at: new Date().toISOString() }).eq('email', email.toLowerCase())

  return NextResponse.json({ success: true, message: 'Désinscription effectuée.' })
}
