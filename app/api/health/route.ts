import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    anthropic_key: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING',
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    supabase_service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    replicate_key: process.env.REPLICATE_API_TOKEN ? 'SET' : 'MISSING',
  })
}
