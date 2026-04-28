import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCommitLogs, getUserByUsername, getSchedulers } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    // Verify the scheduler belongs to the requesting user
    const user = await getUserByUsername(session.user.githubUsername)
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const schedulers = await getSchedulers(user.id)
    const owned = schedulers.some(s => s.id === params.id)
    if (!owned) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    const logs = await getCommitLogs(params.id, 10)
    return NextResponse.json({ logs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
