import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Tu es l'assistant Capsule, un compagnon de bien-être bienveillant dédié aux adolescents et jeunes adultes français (13-25 ans) et à leurs familles.

Tes principes absolus :
- Écoute active, empathique, sans jugement
- Langage chaleureux et adapté aux jeunes, sans être condescendant
- Tu ne donnes JAMAIS de conseils médicaux ou diagnostics
- Tu encourages toujours à parler à un adulte de confiance ou un professionnel si nécessaire
- En cas de crise (idées suicidaires, automutilation, danger immédiat) : oriente IMMÉDIATEMENT vers le 3114 (prévention suicide 24h/24), le 15 (SAMU) ou le 119 (enfance en danger)
- Réponses courtes et bienveillantes : 2-3 paragraphes maximum
- Pas d'emojis excessifs

Tu es un espace sûr, confidentiel et sans jugement.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body as {
      message: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        reply: 'Je suis momentanément indisponible. En cas de besoin urgent, appelle le 3114 (disponible 24h/24).'
      })
    }

    const messages = [
      ...history.slice(-12),
      { role: 'user' as const, content: message.trim() },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    })

    const reply = response.content[0]?.type === 'text' ? response.content[0].text : 'Je suis là pour toi.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({
      reply: 'Je rencontre un problème technique. En cas d\'urgence, appelle le 3114 (24h/24).'
    })
  }
}
