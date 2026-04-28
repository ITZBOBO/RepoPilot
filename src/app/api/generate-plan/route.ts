import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function sanitize(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return ''
  return v.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/`/g, "'").slice(0, maxLen).trim()
}
function sanitizeArray(arr: unknown, maxLen: number, maxItems = 8): string[] {
  if (!Array.isArray(arr)) return []
  return arr.slice(0, maxItems).map(i => sanitize(i, maxLen)).filter(Boolean)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body.' }, { status: 400 }) }

  const projectTitle  = sanitize(body.projectTitle, 120) || 'My Project'
  const description   = sanitize(body.description, 300)
  const stack         = sanitizeArray(body.stack, 40)
  const difficulty    = sanitize(body.difficulty, 20) || 'INTERMEDIATE'
  const estimatedDays = parseInt(body.estimatedDays) || 7
  const goal          = sanitize(body.goal, 100) || 'portfolio growth'
  const whyItFits     = sanitize(body.whyItFits, 200)

  const prompt = `You are RepoPilot, an expert AI GitHub assistant for developers.

A developer has selected this project idea:
- Title: ${projectTitle}
- Description: ${description}
- Stack: ${stack.join(', ') || 'React, Tailwind CSS, TypeScript'}
- Difficulty: ${difficulty}
- Estimated time: ${estimatedDays} days
- Goal: ${goal}
- Why it fits: ${whyItFits}

Generate a complete project plan. Return ONLY valid JSON (no markdown, no fences, no extra text):

{
  "overview": "2-3 sentence project overview",
  "targetAudience": "who this project is for",
  "designDirection": "color palette, style direction (e.g. dark, minimal, bold)",
  "features": [
    { "name": "Feature Name", "description": "1 sentence", "priority": "MUST" | "SHOULD" | "NICE" }
  ],
  "advancedFeatures": ["optional advanced feature 1", "optional advanced feature 2"],
  "techStack": {
    "framework": "e.g. Next.js",
    "styling": "e.g. Tailwind CSS",
    "extras": ["e.g. Framer Motion", "React Hook Form"]
  },
  "roadmap": [
    { "phase": 1, "title": "Phase title", "days": "Day 1-2", "tasks": ["task 1", "task 2"] }
  ],
  "repoName": "kebab-case-repo-name",
  "repoDescription": "One sentence GitHub repo description (max 120 chars)",
  "folderStructure": "/src\\n  /components\\n  /pages\\n  /hooks\\n  /utils",
  "readme": "Full markdown README content with badges, description, features, setup instructions, and tech stack",
  "commits": [
    { "order": 1, "message": "init: setup project with Vite and Tailwind CSS" }
  ],
  "timeline": [
    { "day": "Day 1", "focus": "Setup and layout" }
  ]
}

Rules:
- features array: 6-10 items
- roadmap: 4-5 phases
- commits: 6-8 meaningful commit messages following conventional commits
- readme: full, professional, ready to paste into GitHub
- repoName: lowercase, hyphens only, no spaces`

  async function callClaude(p: string) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey as string, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 4000, messages: [{ role: 'user', content: p }] }),
    })
    if (!r.ok) throw new Error(`Claude ${r.status}`)
    const d = await r.json()
    return d.content?.[0]?.text ?? ''
  }

  function parse(text: string) {
    const cleaned = text.replace(/^```(?:json)?\s*/im, '').replace(/\s*```$/im, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed.repoName || !parsed.features || !parsed.roadmap) throw new Error('Missing required fields')
    return parsed
  }

  try {
    const text = await callClaude(prompt)
    try {
      return NextResponse.json(parse(text))
    } catch {
      // retry once
      const text2 = await callClaude(prompt + '\n\nCRITICAL: Return ONLY valid JSON. No extra text.')
      return NextResponse.json(parse(text2))
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to generate plan.' }, { status: 500 })
  }
}
