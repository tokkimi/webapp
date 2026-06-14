import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { getAuthenticatedClient } from '@/lib/server-supabase'

export async function POST(req: NextRequest) {
  const { planId } = await req.json()
  const plan = PLANS[planId as keyof typeof PLANS]
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const { user } = await getAuthenticatedClient(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.STRIPE_SECRET_KEY || !plan.priceId) {
    return NextResponse.json({ error: 'Paiement non configure' }, { status: 503 })
  }

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
