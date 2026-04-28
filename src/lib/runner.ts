/**
 * Core commit runner — shared between /api/scheduler/run (manual) and /api/cron (scheduled).
 */
import {
  getSchedulerWithUser, logCommit,
  updateSchedulerLastRun, incrementCommitCount,
} from './db'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const RunnerResultSchema = z.object({
  code: z.string().describe("The complete file content as a string"),
  commitMessage: z.string().max(72).describe("A conventional commit message, max 72 chars")
})

export async function runScheduler(schedulerId: string, githubToken: string) {
  const { Octokit } = await import('@octokit/rest')
  const octokit = new Octokit({ auth: githubToken })

  const scheduler = await getSchedulerWithUser(schedulerId)
  const [owner, repo] = scheduler.repo_full_name.split('/')
  const path = scheduler.file_path

  // 1. Try to fetch existing file
  let existingContent = ''
  let existingSha: string | undefined

  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path })
    if ('content' in data && 'sha' in data) {
      existingContent = Buffer.from(data.content as string, 'base64').toString('utf-8')
      existingSha     = data.sha as string
    }
  } catch (e: any) {
    if (e.status !== 404) throw e
  }

  // 2. Call Claude with Structured Outputs (Tool Calling)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  
  const anthropic = new Anthropic({ apiKey })

  const prompt = `You are a professional software engineer making a small, meaningful improvement to a codebase.

File: ${path}
Language: ${scheduler.language}
Task description: ${scheduler.description}

${existingContent
  ? `Current file content:\n\`\`\`\n${existingContent.slice(0, 3000)}\n\`\`\`\n\nMake a small, meaningful improvement to this file.`
  : 'This is a new file. Write the initial implementation.'}`

  let generated: { code: string; commitMessage: string }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.3, // Slight creativity for variations in commits
      messages: [{ role: 'user', content: prompt }],
      tools: [
        {
          name: "output_commit_result",
          description: "Output the final generated file code and the commit message.",
          input_schema: {
            type: "object",
            properties: {
              code: { type: "string", description: "The complete file content as a string" },
              commitMessage: { type: "string", description: "A conventional commit message, max 72 chars" }
            },
            required: ["code", "commitMessage"]
          }
        }
      ],
      tool_choice: { type: "tool", name: "output_commit_result" }
    })

    const toolCall = message.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
    if (!toolCall) throw new Error('Claude failed to return a structured tool call.')

    generated = RunnerResultSchema.parse(toolCall.input)
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      throw new Error('AI generated invalid structure. Zod validation failed.')
    }
    throw new Error(`Anthropic API error: ${e.message}`)
  }

  // 3. Push to GitHub
  const encodedContent = Buffer.from(generated.code, 'utf-8').toString('base64')

  const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message:  generated.commitMessage,
    content:  encodedContent,
    ...(existingSha ? { sha: existingSha } : {}),
  })

  const commitSha = commitData.commit.sha ?? null

  // 4. Log + update stats
  await logCommit({
    schedulerId,
    commitSha,
    commitMessage: generated.commitMessage,
    filePath:      path,
    success:       true,
  })
  await updateSchedulerLastRun(schedulerId)
  await incrementCommitCount(schedulerId)

  return { commitSha, commitMessage: generated.commitMessage }
}
