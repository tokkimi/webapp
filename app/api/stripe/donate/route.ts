import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', { apiVersion: '2026-05-27.dahlia' })
  const { amount, method, name, email, message } = await request.json()

  if (!amount || amount < 1) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
  }

  const amountCents = Math.round(parseFloat(amount) * 100)

  try {
    if (method === 'paypal') {
      // PayPal redirect (if configured)
      const paypalUrl = process.env.PAYPAL_DONATE_URL
      if (paypalUrl) {
        return NextResponse.json({ url: `${paypalUrl}?amount=${amount}` })
      }
      // Fallback: use Stripe with PayPal payment method if enabled
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Don Capsule Ado — ${name || 'Anonyme'}`,
            description: message || 'Soutien à la plateforme Capsule Ado',
            images: [],
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      customer_email: email || undefined,
      metadata: {
        type: 'donation',
        donor_name: name || 'Anonyme',
        message: message || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dons?success=1&amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dons`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
