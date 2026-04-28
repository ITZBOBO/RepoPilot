import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { saveSuggestion } from '@/lib/db'

// ─── Sanitisation helpers ─────────────────────────────────
function san(value: string, maxLen: number): string {
  return value
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/`/g, "'")
    .slice(0, maxLen)
    .trim()
}

function sanArr(arr: string[], itemMax: number, listMax = 8): string[] {
  return arr.slice(0, listMax).map(v => san(v, itemMax)).filter(Boolean)
}

// ─── Zod schema ───────────────────────────────────────────
const SuggestionsSchema = z.object({
  who:       z.string().max(120).default('developer'),
  situation: z.string().max(250).default('building portfolio'),
  time:      z.string().max(60).default('1 week'),
  goal:      z.string().max(120).default('get hired'),
  stack:     z.array(z.string().max(50)).max(10).default([]),
})

// ─── Route handler ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 })
  }

  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) {
    return NextResponse.json({ error: 'Cannot resolve GitHub username from session.' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = SuggestionsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 },
    )
  }

  const d = parsed.data

  const who       = san(d.who, 100)       || 'developer'
  const situation = san(d.situation, 200) || 'building portfolio'
  const time      = san(d.time, 50)       || '1 week'
  const goal      = san(d.goal, 100)      || 'get hired'
  const stack     = sanArr(d.stack, 40)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  const prompt = `You are RepoPilot, an AI assistant helping developers build better GitHub portfolios.
Generate 3 portfolio project suggestions for a developer with the following profile:
- Who: ${who}
- Situation: ${situation}
- Time available: ${time}
- Stack: ${stack.length ? stack.join(', ') : 'JavaScript, React'}
- Goal: ${goal}

Format the output entirely as Markdown. For each project, include:
- A catchy title
- A short description
- Why it fits this developer
- Estimated difficulty and time
- Recommended tech stack
- 4-5 key features to build
Use headings, bold text, and bullet points. Do not include any intro/outro text, just the markdown.`

  try {
    const anthropic = new Anthropic({ apiKey })
    
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              fullContent += text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
          
          // Once stream finishes, save to DB in the background
          try {
            await saveSuggestion(githubUsername, fullContent)
          } catch (dbErr) {
            console.error('Failed to save suggestion to DB:', dbErr)
          }
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
    console.error('Suggestions API error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate suggestions.' },
      { status: 500 },
    )
  }
}
