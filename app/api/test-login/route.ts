import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TEST_EMAILS } from '@/lib/test-accounts'

const TEST_PASSWORD = 'BlueCIrcle_Test_2025!'

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey || serviceKey.startsWith('placeholder')) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = TEST_EMAILS[0]

  // Create user instantly confirmed — idempotent (ignore if already exists)
  await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  // Sign in to get real session tokens
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data, error } = await anon.auth.signInWithPassword({ email, password: TEST_PASSWORD })

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 400 })
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
}
