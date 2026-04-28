import type { Metadata } from 'next'
import AnalyzerClient from './AnalyzerClient'

interface Props { params: { username: string } }

// Lightweight GitHub fetch to compute OG image params — no AI, no Anthropic call
async function getQuickStats(username: string) {
  try {
    const headers: HeadersInit = process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=pushed`, { headers, next: { revalidate: 3600 } }),
    ])

    if (!userRes.ok) return null

    const user  = await userRes.json()
    const repos: any[] = reposRes.ok ? await reposRes.json() : []

    // Compute a rough score (same heuristic as badge route)
    const score = Math.min(95, 20 + Math.min(repos.length * 3, 30) + Math.min(user.followers * 2, 20) + (user.bio ? 10 : 0) + (user.location ? 5 : 0))

    // Top language by frequency
    const langCounts: Record<string, number> = {}
    repos.forEach((r: any) => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Code'

    // Days since last push
    const lastPush = repos[0]?.pushed_at
    const days = lastPush
      ? Math.floor((Date.now() - new Date(lastPush).getTime()) / 86_400_000)
      : 0

    return { score, topLang, days, name: user.name || username }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = params
  const stats = await getQuickStats(username)

  const score  = stats?.score  ?? '??'
  const lang   = stats?.topLang ?? 'Code'
  const days   = stats?.days   ?? 0
  const name   = stats?.name   ?? username

  const title       = `@${username}'s GitHub Portfolio Score: ${score}/100`
  const description = `${name} got a ${score}/100 on RepoPilot's GitHub Profile Analyzer. Top language: ${lang}. See the full breakdown — and roast.`

  const base   = process.env.NEXTAUTH_URL ?? 'https://repopilot.com'
  const ogUrl  = `${base}/api/og?username=${encodeURIComponent(username)}&score=${score}&lang=${encodeURIComponent(lang)}&days=${days}`
  const pageUrl = `${base}/analyze/${username}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${username}'s RepoPilot Portfolio Score` }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [ogUrl],
    },
  }
}

export default function AnalyzerPage({ params }: Props) {
  return <AnalyzerClient username={params.username} />
}
