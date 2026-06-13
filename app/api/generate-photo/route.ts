import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { buildReplicatePrompt, getCharacterSeed } from '@/lib/ai'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

export async function POST(req: NextRequest) {
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
    const output = await replicate.run(
      'lucataco/realvisxl-v2.0:7d6a2f9c4754477b12c14ed2a58f89bb85128edcdd581d24ce58b6926029de08',
      {
        input: {
          prompt,
          negative_prompt,
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 35,
          guidance_scale: 7,
          seed,
          disable_safety_checker: true,
        },
      }
    ) as string[]

    const url = output?.[0] || null
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Photo generation error:', err?.message ?? err)
    return NextResponse.json({ url: null, error: err?.message })
  }
}
