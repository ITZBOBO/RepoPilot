import { NextRequest, NextResponse } from 'next/server'
import { getShieldEnabledUsers } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'
import { sendStreakWarningEmail } from '@/lib/email'
import Anthropic from '@anthropic-ai/sdk'

// Runs at 0 20 * * * (8pm UTC) — configured in vercel.json
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { Octokit } = await import('@octokit/rest')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // --- 1. Streak Shield: commit for users with shield ON who haven't committed today ---
    const shieldUsers = await getShieldEnabledUsers()
    const today = new Date().toISOString().split('T')[0]

    const shieldResults = await Promise.allSettled(shieldUsers.map(async (user) => {
      const octokit = new Octokit({ auth: user.github_token })
      const username = user.github_username

      // Check today's activity
      const { data: events } = await octokit.activity.listPublicEventsForUser({ username, per_page: 30 })
        .catch(() => octokit.activity.listEventsForAuthenticatedUser({ username, per_page: 30 }))

      const committedToday = events.some(e =>
        e.type === 'PushEvent' && e.created_at?.startsWith(today)
      )
      if (committedToday) return { username, status: 'skipped', reason: 'Already committed today' }

      // Ensure shield repo exists
      const repoName = 'repopilot-streak-shield'
      try {
        await octokit.repos.get({ owner: username, repo: repoName })
      } catch (err: any) {
        if (err.status === 404) {
          await octokit.repos.createForAuthenticatedUser({
            name: repoName, private: true, auto_init: true,
            description: 'RepoPilot Streak Shield — keeping my streak alive.',
          })
        } else throw err
      }

      // Generate log entry
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022', max_tokens: 150, temperature: 0.7,
        messages: [{ role: 'user', content: 'Generate a single-sentence developer "Today I Learned" or Dev Log entry. Sound authentic. No markdown, no intro, just the raw sentence.' }],
      })
      const logText = message.content[0].type === 'text' ? message.content[0].text : 'Reviewing docs and improving code quality.'

      // Fetch existing file
      const path = 'dev-log.md'
      let existingSha: string | undefined
      let currentContent = `# Developer Log\n`

      try {
        const { data: fileData } = await octokit.repos.getContent({ owner: username, repo: repoName, path })
        if ('sha' in fileData && 'content' in fileData) {
          existingSha = fileData.sha as string
          currentContent = Buffer.from(fileData.content as string, 'base64').toString('utf-8')
        }
      } catch (e: any) { if (e.status !== 404) throw e }

      const newContent = currentContent.trimEnd() + `\n\n### ${today}\n${logText}`
      await octokit.repos.createOrUpdateFileContents({
        owner: username, repo: repoName, path,
        message: 'chore: update dev log [streak-shield]',
        content: Buffer.from(newContent, 'utf-8').toString('base64'),
        ...(existingSha ? { sha: existingSha } : {}),
      })

      return { username, status: 'shielded', log: logText }
    }))

    // --- 2. Streak Warning: email users with shield OFF who haven't committed today ---
    // Fetch non-shield users who have an email
    const { data: noShieldUsers } = await supabaseAdmin
      .from('users')
      .select('github_username, email, github_token')
      .eq('streak_shield_enabled', false)
      .not('email', 'is', null)
      .not('github_token', 'is', null)

    const warnResults = await Promise.allSettled((noShieldUsers ?? []).map(async (user) => {
      if (!user.email || !user.github_token) return { username: user.github_username, status: 'skipped' }

      try {
        const octokit = new Octokit({ auth: user.github_token })
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
          username: user.github_username, per_page: 20,
        })
        const committedToday = events.some(e =>
          e.type === 'PushEvent' && e.created_at?.startsWith(today)
        )
        if (committedToday) return { username: user.github_username, status: 'skipped', reason: 'Already committed' }

        await sendStreakWarningEmail(user.email, user.github_username)
        return { username: user.github_username, status: 'warned' }
      } catch {
        return { username: user.github_username, status: 'error' }
      }
    }))

    return NextResponse.json({
      shield: shieldResults.map(r => r.status === 'fulfilled' ? r.value : { status: 'error' }),
      warnings: warnResults.map(r => r.status === 'fulfilled' ? r.value : { status: 'error' }),
    })
  } catch (err: any) {
    console.error('Shield cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
