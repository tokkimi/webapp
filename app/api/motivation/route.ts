import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/server-supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if today's motivation already exists
  const { data: existing, error: fetchError } = await supabase
    .from('daily_motivations')
    .select('*')
    .eq('generated_date', today)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (existing) {
    // Get user's liked status
    const { data: userMotivation } = await supabase
      .from('user_motivations')
      .select('liked')
      .eq('motivation_id', existing.id)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      ...existing,
      liked: userMotivation?.liked ?? null,
    })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const fallbacks = [
      { content: 'Tu n’as pas besoin de tout réussir aujourd’hui. Un petit pas compte déjà.', author_style: 'bienveillant' },
      { content: 'Ta valeur ne dépend pas de ta productivité. Tu as le droit d’avancer à ton rythme.', author_style: 'rassurant' },
      { content: 'Même une journée difficile ne définit pas toute ton histoire.', author_style: 'inspirant' },
    ]
    const fallback = fallbacks[new Date().getDate() % fallbacks.length]
    const { data, error } = await supabase.from('daily_motivations').insert({
      generated_date: today,
      ...fallback,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, liked: null })
  }

  // Generate new motivation via Claude
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        "Tu es un générateur de phrases de motivation bienveillantes pour les adolescents français (13-25 ans). Génère une phrase inspirante, positive, et adaptée aux jeunes. Sois chaleureux, authentique. Varie les styles: inspirational, poétique, philosophique, humoristique. Réponds en JSON: {content: string, author_style: string}",
      messages: [
        {
          role: 'user',
          content: `Génère une phrase de motivation pour aujourd'hui (${today}).`,
        },
      ],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    let parsed: { content: string; author_style: string }
    try {
      // Strip potential markdown code fences
      const raw = textContent.text.replace(/```json\n?|```\n?/g, '').trim()
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('Failed to parse Claude response as JSON')
    }

    // Save to DB
    const { data: newMotivation, error: insertError } = await supabase
      .from('daily_motivations')
      .insert({
        generated_date: today,
        content: parsed.content,
        author_style: parsed.author_style,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ...newMotivation, liked: null })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, supabase } = await getAuthenticatedClient(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { motivation_id, liked } = body as { motivation_id: string; liked: boolean }

  if (!motivation_id || typeof liked !== 'boolean') {
    return NextResponse.json({ error: 'motivation_id and liked are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('user_motivations')
    .upsert(
      {
        user_id: user.id,
        motivation_id,
        liked,
      },
      { onConflict: 'user_id,motivation_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
