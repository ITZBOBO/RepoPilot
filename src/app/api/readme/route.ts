import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      projectName   = 'My Project',
      description   = '',
      stack         = [],
      features      = [],
      hasLiveDemo   = false,
      liveUrl       = '',
      installSteps  = '',
    } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set.' }, { status: 503 })
    }

    const stackStr    = Array.isArray(stack)    ? stack.join(', ')    : stack
    const featuresStr = Array.isArray(features) ? features.join(', ') : features

    const prompt = `Generate a professional, production-quality README.md for the following project.

Project details:
- Name: ${projectName}
- Description: ${description}
- Tech Stack: ${stackStr || 'Not specified'}
- Key Features: ${featuresStr || 'Not specified'}
- Has Live Demo: ${hasLiveDemo ? `Yes — ${liveUrl}` : 'No'}
- Special Install Notes: ${installSteps || 'None'}

Requirements for the README:
1. Start with a project banner section (title, badges, description)
2. Include a "Features" section with bullet points
3. Include a "Tech Stack" section
4. Include a "Getting Started" section with Prerequisites and Installation
5. If live demo exists, include a "Live Demo" section
6. Include a "Usage" section with a code example
7. Include a "Contributing" section
8. Include a "License" section (MIT)
9. Use GitHub-flavoured markdown with proper headers, code blocks, and badges
10. Make it impressive and recruiter-ready

Return ONLY the raw markdown content. No explanations, no code fences around the whole response.`

    const anthropic = new Anthropic({ apiKey })
    
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('Streaming error:', err)
          controller.error(err)
        }
      }
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      }
    })
  } catch (err: any) {
    console.error('README API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate README.' }, { status: 500 })
  }
}
