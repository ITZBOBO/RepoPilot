import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { getUserByUsername } from '@/lib/db'

// ─── Sanitisation helpers ─────────────────────────────────
function san(value: string, maxLen: number): string {
  return value.replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, maxLen).trim()
}

function sanArr(arr: string[], itemMax: number, listMax = 20): string[] {
  return arr.slice(0, listMax).map(v => san(v, itemMax)).filter(Boolean)
}

// ─── Zod schema ───────────────────────────────────────────
const PublishSchema = z.object({
  repoName:    z.string().min(1, 'repoName is required.').max(100),
  description: z.string().max(350).default(''),
  readme:      z.string().min(1, 'readme content is required.').max(500_000),
  topics:      z.array(z.string().max(35)).max(20).default([]),
  visibility:  z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
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

  const parsed = PublishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 },
    )
  }

  const { repoName, description, readme, topics, visibility } = parsed.data

  // Retrieve the GitHub token from the DB (server-side only — never from the client body)
  const githubUsername = (session.user as any).githubUsername as string | undefined
  if (!githubUsername) {
    return NextResponse.json({ error: 'Cannot resolve GitHub username from session.' }, { status: 400 })
  }

  const dbUser = await getUserByUsername(githubUsername).catch(() => null)
  const githubToken = dbUser?.github_token
  if (!githubToken) {
    return NextResponse.json(
      { error: 'GitHub token not found. Re-connect your GitHub account in Settings.' },
      { status: 401 },
    )
  }

  // Sanitise inputs before sending to GitHub API
  const cleanRepoName    = san(repoName, 100).replace(/[^a-zA-Z0-9._-]/g, '-')
  const cleanDescription = san(description, 350)
  const cleanTopics      = sanArr(topics, 35).map(t => t.toLowerCase().replace(/[^a-z0-9-]/g, ''))

  if (!cleanRepoName) {
    return NextResponse.json({ error: 'Invalid repository name after sanitisation.' }, { status: 400 })
  }

  try {
    // 1. Create the repository
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${githubToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        name:        cleanRepoName,
        description: cleanDescription,
        private:     visibility === 'PRIVATE',
        auto_init:   false,
        has_issues:  true,
        has_projects: false,
        has_wiki:    false,
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.json()
      return NextResponse.json({ error: err.message || 'Failed to create repo.' }, { status: 400 })
    }

    const repo = await createRes.json()

    // 2. Push README.md
    const readmeContent = Buffer.from(readme).toString('base64')
    await fetch(`https://api.github.com/repos/${repo.full_name}/contents/README.md`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'docs: initialise project with README',
        content: readmeContent,
      }),
    })

    // 3. Add topics
    if (cleanTopics.length) {
      await fetch(`https://api.github.com/repos/${repo.full_name}/topics`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.mercy-preview+json',
        },
        body: JSON.stringify({ names: cleanTopics }),
      })
    }

    return NextResponse.json({
      success: true,
      githubUrl: repo.html_url,
      repoFullName: repo.full_name,
    })
  } catch (err) {
    console.error('Publish API error:', err)
    return NextResponse.json({ error: 'Failed to publish repository.' }, { status: 500 })
  }
}
