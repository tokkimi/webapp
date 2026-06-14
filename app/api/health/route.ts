import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    groq_key: process.env.GROQ_API_KEY ? 'SET' : 'MISSING',
    anthropic_key: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING',
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    supabase_service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    replicate_key: process.env.REPLICATE_API_TOKEN ? 'SET' : 'MISSING',
    stripe_secret: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
    stripe_webhook: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING',
  })
}
