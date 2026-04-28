import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const { Octokit } = await import('@octokit/rest')
    const octokit = new Octokit({ auth: session.accessToken })

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      visibility: 'all',
    })

    const repos = data.map(r => ({
      name:      r.name,
      full_name: r.full_name,
      private:   r.private,
      language:  r.language,
    }))

    return NextResponse.json({ repos })
  } catch (err: any) {
    console.error('GitHub repos API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
