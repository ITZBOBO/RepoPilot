import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSchedulerWithUser, logCommit } from '@/lib/db'
import { runScheduler } from '@/lib/runner'

// POST /api/scheduler/run — manual trigger
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { schedulerId } = await req.json()
  if (!schedulerId) return NextResponse.json({ error: 'schedulerId required.' }, { status: 400 })

  try {
    const scheduler = await getSchedulerWithUser(schedulerId)
    const user = (scheduler as any).users
    if (!user || user.github_username !== session.user.githubUsername) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const result = await runScheduler(schedulerId, user.github_token)
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    try {
      await logCommit({
        schedulerId,
        commitSha:     null,
        commitMessage: 'Failed run',
        filePath:      '',
        success:       false,
        errorMessage:  err.message,
      })
    } catch {}
    console.error('Scheduler run error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
