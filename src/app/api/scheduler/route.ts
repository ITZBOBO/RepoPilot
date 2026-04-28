import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getUserByUsername, getSchedulers,
  createScheduler, updateSchedulerStatus,
} from '@/lib/db'

// GET /api/scheduler — list all schedulers for current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    const user = await getUserByUsername(session.user.githubUsername)
    if (!user) return NextResponse.json({ schedulers: [] })

    const schedulers = await getSchedulers(user.id)
    return NextResponse.json({ schedulers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/scheduler — create new scheduler
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    const body = await req.json()
    const { repoFullName, filePath, language, description, cronExpression } = body

    if (!repoFullName || !filePath || !language || !description || !cronExpression) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const user = await getUserByUsername(session.user.githubUsername)
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const repoName = repoFullName.split('/')[1] ?? repoFullName

    const scheduler = await createScheduler({
      userId: user.id,
      repoName,
      repoFullName,
      cronExpression,
      description,
      language,
      filePath,
    })

    return NextResponse.json({ scheduler }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/scheduler — update status (pause/resume/delete)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    const { id, status } = await req.json()
    if (!id || !['active', 'paused', 'deleted'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status.' }, { status: 400 })
    }

    await updateSchedulerStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
