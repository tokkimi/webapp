import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { planId } = await req.json()
  const plan = PLANS[planId as keyof typeof PLANS]
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } } as any
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId ?? undefined, quantity: 1 }],
    customer_email: user.email,
    metadata: { user_id: user.id, plan_id: planId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
  })

  return NextResponse.json({ url: session.url })
}
