import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { updateUserPreferences } from '@/lib/db'

// ─── Zod schema ───────────────────────────────────────────
const PreferencesSchema = z.object({
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    message: 'skillLevel must be BEGINNER, INTERMEDIATE, or ADVANCED.',
  }),
  goal: z.enum(['internship', 'job', 'freelance', 'learning'], {
    message: 'goal must be one of: internship, job, freelance, learning.',
  }),
  stack: z.array(z.string()).max(15, 'Maximum 15 technologies allowed.').default([]),
})

// ─── POST /api/settings/preferences ──────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = PreferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 },
    )
  }

  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) {
    return NextResponse.json(
      { error: 'Cannot resolve GitHub username from session.' },
      { status: 400 },
    )
  }

  try {
    await updateUserPreferences(githubUsername, parsed.data)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Settings preferences API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save preferences.' }, { status: 500 })
  }
}
