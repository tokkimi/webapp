import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    content,
    mood_score,
    generate_ai_response = false,
  } = body as {
    content: string
    mood_score?: number
    generate_ai_response?: boolean
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  let ai_response: string | null = null

  if (generate_ai_response) {
    try {
      const aiResp = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system:
          "Tu es Capsule, un compagnon de bien-être pour ados. L'utilisateur partage une entrée de journal. Réponds avec douceur, empathie et bienveillance. Maximum 3 phrases. Sois réconfortant et valorisant. Ne donne pas de conseils non demandés. Commence par reconnaître ce qu'il/elle a partagé.",
        messages: [{ role: 'user', content }],
      })

      const textBlock = aiResp.content.find((c) => c.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        ai_response = textBlock.text
      }
    } catch {
      // Non-fatal; proceed without AI response
    }
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      content,
      mood_score: mood_score ?? null,
      ai_response,
      is_private: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
