import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/dashboard/stats
 * Returns real streak, scheduler count, and total commit count for the
 * authenticated user. Falls back gracefully if Supabase tables don't exist yet.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) {
    return NextResponse.json({ error: 'Cannot resolve user from session.' }, { status: 400 })
  }

  try {
    // Resolve internal user id
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('github_username', githubUsername)
      .single()

    if (!userRow) {
      return NextResponse.json({ streak: 0, schedulers: 0, totalCommits: 0 })
    }

    const userId = userRow.id

    // Active schedulers count
    const { count: schedulers } = await supabaseAdmin
      .from('scheduled_commits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Total successful commits count
    const { count: totalCommits } = await supabaseAdmin
      .from('commit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('scheduled_commits.user_id', userId)
      .eq('success', true)

    // GitHub streak — derive from commit_logs grouped by day
    // This is a simple approach: count distinct days with a successful commit
    // in the last 365 days, up to a continuous streak from today.
    const { data: recentLogs } = await supabaseAdmin
      .from('commit_logs')
      .select('ran_at, scheduled_commits!inner(user_id)')
      .eq('scheduled_commits.user_id', userId)
      .eq('success', true)
      .order('ran_at', { ascending: false })
      .limit(365)

    const streak = computeStreak(recentLogs ?? [])

    return NextResponse.json({
      streak,
      schedulers: schedulers ?? 0,
      totalCommits: totalCommits ?? 0,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    // Return zeros rather than a 500 so the UI degrades gracefully
    return NextResponse.json({ streak: 0, schedulers: 0, totalCommits: 0 })
  }
}

/** Count consecutive calendar days (from today backwards) that have ≥1 commit. */
function computeStreak(logs: Array<{ ran_at: string }>): number {
  if (!logs.length) return 0

  const days = new Set(
    logs.map(l => new Date(l.ran_at).toISOString().slice(0, 10))
  )

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
    } else if (i > 0) {
      // Allow today to be empty (streak not yet broken)
      break
    }
  }

  return streak
}
