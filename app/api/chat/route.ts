import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Tu es Capsule, un compagnon de bien-être bienveillant pour les adolescents français (13-25 ans).

Tes principes:
- Écoute active et empathique, sans jugement
- Langage adapté aux ados: chaleureux, moderne, mais pas condescendant
- Tu encourages TOUJOURS à parler à un adulte de confiance ou un professionnel si nécessaire
- Tu ne donnes JAMAIS de conseils médicaux ou psychologiques formels
- JAMAIS de contenu inapproprié, adulte ou dangereux
- Si quelqu'un mentionne des idées suicidaires, automutilation, ou détresse grave:
  Réponds avec compassion ET affiche IMMÉDIATEMENT les ressources d'urgence:
  "Je t'entends et je suis là pour toi 💜. Ce que tu ressens est important.
  RESSOURCES D'URGENCE:
  📞 3114 - Numéro National Prévention Suicide (24h/24)
  📞 119 - Enfance en Danger
  📞 15 - SAMU
  S'il te plaît, appelle l'un de ces numéros maintenant."
- Utilise des émojis avec modération (1-2 par message max)
- Longueur des réponses: 2-4 paragraphes max, concis`

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
  const { message, conversation_id } = body as {
    message: string
    conversation_id?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  let convId = conversation_id

  // Create conversation if needed
  if (!convId) {
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: message.slice(0, 60),
        message_count: 0,
      })
      .select()
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: convError?.message ?? 'Failed to create conversation' }, { status: 500 })
    }
    convId = conv.id
  }

  // Save user message
  const { error: userMsgError } = await supabase.from('messages').insert({
    conversation_id: convId,
    user_id: user.id,
    role: 'user',
    content: message,
  })

  if (userMsgError) {
    return NextResponse.json({ error: userMsgError.message }, { status: 500 })
  }

  // Fetch last 20 messages for history
  const { data: historyRows, error: historyError } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 })
  }

  const history = (historyRows ?? [])
    .reverse()
    .slice(0, -1) // exclude the message we just inserted (it's included below)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // Stream from Claude
  const encoder = new TextEncoder()
  let assistantContent = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send conversation_id first as a metadata chunk
        const meta = JSON.stringify({ conversation_id: convId }) + '\n'
        controller.enqueue(encoder.encode(meta))

        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: message }],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = event.delta.text
            assistantContent += chunk
            controller.enqueue(encoder.encode(chunk))
          }
        }

        // Save assistant message after stream completes
        await supabase.from('messages').insert({
          conversation_id: convId,
          user_id: user.id,
          role: 'assistant',
          content: assistantContent,
        })

        // Increment message count
        try { await supabase.rpc('increment_message_count', { conv_id: convId }) } catch (_) {
          // Non-critical; ignore if RPC doesn't exist
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(JSON.stringify({ error: message })))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Conversation-Id': convId ?? '',
    },
  })
}
