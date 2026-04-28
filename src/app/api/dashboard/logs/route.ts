import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('github_username', githubUsername)
      .single()

    if (!userRow) {
      return NextResponse.json({ logs: [] })
    }

    const { data: logs, error } = await supabaseAdmin
      .from('commit_logs')
      .select('*, scheduled_commits!inner(repo_full_name, file_path)')
      .eq('scheduled_commits.user_id', userRow.id)
      .order('ran_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Fetch logs error:', error)
      return NextResponse.json({ logs: [] })
    }

    // Map to a friendly format
    const formattedLogs = logs.map((l: any) => {
      const isSuccess = l.success === true
      return {
        id: l.id,
        repo: (l.scheduled_commits.repo_full_name as string).split('/')[1] || l.scheduled_commits.repo_full_name,
        msg: l.commit_message || (isSuccess ? 'Scheduled commit' : 'Failed commit'),
        status: isSuccess ? 'Success' : 'Failed',
        date: l.ran_at, // frontend will format this using relative time
        color: isSuccess ? 'var(--green)' : 'var(--red)',
      }
    })

    return NextResponse.json({ logs: formattedLogs })
  } catch (err) {
    console.error('Dashboard logs error:', err)
    return NextResponse.json({ logs: [] })
  }
}
