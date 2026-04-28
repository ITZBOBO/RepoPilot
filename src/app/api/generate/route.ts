import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// ─── Sanitisation helpers ─────────────────────────────────
/** Strip control chars + backticks, then truncate */
function san(value: string, maxLen: number): string {
  return value
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/`/g, "'")
    .slice(0, maxLen)
    .trim()
}

function sanArr(arr: string[], itemMax: number, listMax = 10): string[] {
  return arr.slice(0, listMax).map(v => san(v, itemMax)).filter(Boolean)
}

// ─── Zod schema ───────────────────────────────────────────
const GenerateSchema = z.object({
  project: z.object({
    name:        z.string().min(1, 'Project name is required.').max(120),
    description: z.string().max(600).default(''),
    stack:       z.array(z.string().max(50)).max(15).default([]),
    features:    z.array(z.string().max(120)).max(10).default([]),
  }),
})

// ─── Route handler ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = GenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 },
    )
  }

  const { project } = parsed.data

  // Sanitise before prompt interpolation
  const name        = san(project.name, 100)
  const description = san(project.description, 500)
  const stack       = sanArr(project.stack, 40)
  const features    = sanArr(project.features, 100)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  const prompt = `Generate GitHub repository assets for this project:
Name: ${name}
Description: ${description}
Stack: ${stack.join(', ')}
Features: ${features.join(', ')}

Return ONLY valid JSON with:
{
  "readme": "full markdown README content",
  "repoName": "kebab-case-name",
  "topics": ["tag1","tag2"],
  "commitPlan": [{"type":"feat","message":"commit message","phase":"Phase 1"}],
  "githubIssues": ["Issue title 1","Issue title 2"]
}
No markdown fences, just JSON.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic error:', response.status, errText)
      throw new Error(`AI service error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    const cleaned = text.replace(/```json|```/g, '').trim()

    let assets: unknown
    try {
      assets = JSON.parse(cleaned)
    } catch {
      throw new Error('AI returned invalid JSON. Please try again.')
    }

    return NextResponse.json({ assets })
  } catch (err: any) {
    console.error('Generate API error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed.' }, { status: 500 })
  }
}
