import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    // 1. Fetch public GitHub data
    // Use an env token if available to avoid rate limits, otherwise unauthenticated
    const octokit = new Octokit(process.env.GITHUB_TOKEN ? { auth: process.env.GITHUB_TOKEN } : {})
    
    // Fetch user profile
    const { data: userProfile } = await octokit.users.getByUsername({ username })
    
    // Fetch repos
    const { data: repos } = await octokit.repos.listForUser({
      username,
      per_page: 30,
      sort: 'pushed',
      direction: 'desc'
    })

    // Fetch recent events to find "last active"
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 10
    })

    const lastActiveEvent = events.find(e => e.type === 'PushEvent' || e.type === 'CreateEvent' || e.type === 'PullRequestEvent')
    const lastActiveDate = lastActiveEvent?.created_at || userProfile.updated_at
    const daysSinceActive = lastActiveDate ? Math.floor((new Date().getTime() - new Date(lastActiveDate).getTime()) / (1000 * 3600 * 24)) : 'Unknown'

    // Calculate READMEless repos and top repos (proxy for pinned)
    const topRepos = repos.slice(0, 6).map(r => ({
      name: r.name,
      hasDescription: !!r.description,
      language: r.language,
      stars: r.stargazers_count,
    }))

    // To properly check READMEs we'd need to fetch each one, but to save rate limits
    // we'll approximate or use a smaller sample.
    let reposWithoutReadme = 0
    let totalReposChecked = 0
    
    // We'll only check the top 10 most recent repos for README to save time/limits
    for (const repo of repos.slice(0, 10)) {
      try {
        await octokit.repos.getReadme({ owner: username, repo: repo.name })
      } catch (err: any) {
        if (err.status === 404) reposWithoutReadme++
      }
      totalReposChecked++
    }

    // 2. Generate Analysis via Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `You are a Senior Developer reviewing a junior/mid-level developer's GitHub profile. 
The developer's username is ${username}.

Here is their public data:
- Public Repos: ${userProfile.public_repos}
- Followers: ${userProfile.followers}
- Days since last active: ${daysSinceActive}
- Repos without READMEs (in their 10 most recent): ${reposWithoutReadme} out of ${totalReposChecked}
- Top 6 Recent/Popular Repos:
${topRepos.map(r => `  * ${r.name} (${r.language || 'No lang'}) - Description: ${r.hasDescription ? 'Yes' : 'No'} - Stars: ${r.stars}`).join('\n')}

Your task is to provide a "brutally encouraging" analysis. Call out real problems but make it funny and not discouraging. 
It should read like a senior dev reviewing their profile over coffee. 

Provide your response in raw JSON format with NO markdown wrapping, matching this exact structure:
{
  "score": <number between 1 and 100 representing portfolio quality>,
  "roast": "<the brutally encouraging review paragraph>",
  "top_languages": ["<lang1>", "<lang2>"],
  "missing_skills": ["<skill1 or practice they are missing>"],
  "fix_this_first": "<the single most impactful actionable advice>"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim()
    const analysis = JSON.parse(cleanJson)

    // Add the specific stats the user requested
    analysis.stats = {
      last_active_days: daysSinceActive,
      readmeless_repos: reposWithoutReadme,
      readmeless_checked: totalReposChecked,
    }

    return NextResponse.json(analysis)

  } catch (err: any) {
    console.error('Analyzer error:', err)
    return NextResponse.json({ error: 'Failed to analyze profile', details: err.message }, { status: 500 })
  }
}
