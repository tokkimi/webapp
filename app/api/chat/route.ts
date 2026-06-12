import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured on server' }, { status: 500 })
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

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const reply = (response.content[0] as any).text
    const generatePhoto = messages.length > 0 && messages.length % 7 === 0
    return NextResponse.json({ reply, generatePhoto })
  } catch (err: any) {
    console.error('Anthropic API error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'API error' }, { status: 500 })
  }
}
