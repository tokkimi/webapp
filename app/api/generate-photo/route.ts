import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { buildReplicatePrompt, getCharacterSeed } from '@/lib/ai'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ url: null })
  }

  const { aiConfig } = await req.json()
  const { prompt, negative_prompt } = buildReplicatePrompt({
    gender: aiConfig.gender,
    hair: aiConfig.hair,
    eyes: aiConfig.eyes,
    build: aiConfig.build,
    style: aiConfig.style,
    personality: aiConfig.personality,
  })

  const seed = getCharacterSeed({
    gender: aiConfig.gender,
    hair: aiConfig.hair,
    eyes: aiConfig.eyes,
    build: aiConfig.build,
    style: aiConfig.style,
    personality: aiConfig.personality,
  })

  try {
    // stability-ai/sdxl supports disable_safety_checker natively
    const output = await replicate.run(
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      {
        input: {
          prompt,
          negative_prompt,
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          seed,
          disable_safety_checker: true,
        },
      }
    ) as string[]

    return NextResponse.json({ url: output?.[0] || null })
  } catch (err: any) {
    console.error('Photo generation error:', err?.message ?? err)
    return NextResponse.json({ url: null })
  }
}
