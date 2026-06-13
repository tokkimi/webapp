import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { buildSystemPrompt } from '@/lib/ai'

// Models tried in order — each has its own daily quota
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'llama-3.1-8b-instant',
]

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured on server' }, { status: 500 })
  }

  const { messages, aiConfig, lang } = await req.json()

  const systemPrompt = buildSystemPrompt({
    gender: aiConfig.gender,
    personality: aiConfig.personality,
    hair: aiConfig.hair,
    eyes: aiConfig.eyes,
    build: aiConfig.build,
    style: aiConfig.style,
    lang,
  })

  const client = new Groq({ apiKey })
  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  for (const model of MODELS) {
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 250,
        messages: groqMessages,
      })
      const reply = response.choices[0]?.message?.content ?? ''
      const generatePhoto = messages.length > 0 && messages.length % 5 === 0
      return NextResponse.json({ reply, generatePhoto })
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('rate_limit') || err?.message?.includes('Rate limit')
      if (isRateLimit) {
        console.warn(`Rate limit on ${model}, trying next...`)
        continue
      }
      console.error(`Groq error on ${model}:`, err?.message)
      return NextResponse.json({ error: err?.message ?? 'API error' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Tous les modèles sont temporairement limités. Réessaie dans quelques minutes.' }, { status: 429 })
}
