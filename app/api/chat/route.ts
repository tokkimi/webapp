import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { buildSystemPrompt } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured on server' }, { status: 500 })
  }

  const { messages, aiConfig, lang } = await req.json()
  const fr = lang !== 'en'

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
    const client = new Groq({ apiKey })
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      ],
    })

    const reply = response.choices[0]?.message?.content ?? ''
    const generatePhoto = messages.length > 0 && messages.length % 5 === 0
    return NextResponse.json({ reply, generatePhoto })
  } catch (err: any) {
    const msg = err?.message ?? ''
    console.error('Groq API error:', msg)
    // Return the real error so the client can show appropriate message
    return NextResponse.json({ error: msg || 'API error' }, { status: 500 })
  }
}
