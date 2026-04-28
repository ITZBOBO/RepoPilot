import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { setStreakShield } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const SettingsUpdateSchema = z.object({
  streak_shield_enabled: z.boolean(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) return NextResponse.json({ error: 'Cannot resolve user.' }, { status: 400 })

  try {
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('streak_shield_enabled, skill_level, goal')
      .eq('github_username', githubUsername)
      .single()

    return NextResponse.json({ settings: userRow || {} })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch settings.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) {
    return NextResponse.json({ error: 'Cannot resolve user.' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = SettingsUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 422 })
    }

    await setStreakShield(githubUsername, parsed.data.streak_shield_enabled)
    
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Settings update error:', err)
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
  }
}
