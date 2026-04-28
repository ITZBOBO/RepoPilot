import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// ─── Zod Schema ────────────────────────────────────────────────────────────
// The single source of truth for the generated code payload.
const CodeResultSchema = z.object({
  file_name: z.string().describe("The name of the file, e.g., 'ComponentName.tsx'"),
  file_path: z.string().describe("The full path, e.g., '/components/ComponentName.tsx'"),
  code: z.string().describe("The complete, production-ready React component source code using Tailwind CSS"),
  explanation: z.string().describe("3-4 sentences explaining what the component does and how to use it"),
  dependencies: z.array(z.string()).describe("List of npm packages required (e.g., ['react', 'lucide-react'])")
})

type CodeResult = z.infer<typeof CodeResultSchema>

// ─── Input Types & Sanitization ───────────────────────────────────────────
interface GenerateCodeBody {
  feature: string
  projectTitle: string
  stack: string[]
  level: string
  projectType?: string
  existingFeatures?: string[]
}

function sanitize(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return ''
  return v.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/`/g, "'").slice(0, maxLen).trim()
}

function sanitizeArray(arr: unknown, maxLen: number, maxItems = 8): string[] {
  if (!Array.isArray(arr)) return []
  return arr.slice(0, maxItems).map(i => sanitize(i, maxLen)).filter(Boolean)
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Verify User Session securely via NextAuth
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  // 2. Parse & Sanitize Input
  let body: GenerateCodeBody
  try {
    const raw = await req.json()
    body = {
      feature:          sanitize(raw.feature, 60) || 'Navbar',
      projectTitle:     sanitize(raw.projectTitle, 100) || 'My Project',
      stack:            sanitizeArray(raw.stack, 40),
      level:            sanitize(raw.level, 20) || 'intermediate',
      projectType:      sanitize(raw.projectType, 100),
      existingFeatures: sanitizeArray(raw.existingFeatures, 40, 10),
    }
    if (!body.stack.length) body.stack = ['React', 'Tailwind CSS', 'TypeScript']
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  const prompt = `You are a senior frontend engineer specializing in React and Tailwind CSS.

Generate a clean, production-ready component for the feature: "${body.feature}".

Project Context:
- Project: ${body.projectTitle}
- Type: ${body.projectType || 'frontend UI project'}
- Stack: ${body.stack.join(', ')}
- Skill level: ${body.level}
- Existing features: ${body.existingFeatures?.length ? body.existingFeatures.join(', ') : 'none'}

Requirements:
- Use React functional components with TypeScript
- Use Tailwind CSS for all styling (no inline styles, no CSS files needed)
- Clean, modular, and reusable structure
- Proper TypeScript props interface
- Follow React best practices (keys, accessibility, semantic HTML)
- The component must be complete and immediately usable`

  // 3. AI Generation with Structured Outputs (Tool Calling)
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      temperature: 0.2, // Low temperature for deterministic outputs
      messages: [{ role: 'user', content: prompt }],
      tools: [
        {
          name: "output_code_result",
          description: "Output the final generated React component code and its metadata.",
          input_schema: {
            type: "object",
            properties: {
              file_name: { type: "string", description: "The name of the file, e.g., 'ComponentName.tsx'" },
              file_path: { type: "string", description: "The full path, e.g., '/components/ComponentName.tsx'" },
              code: { type: "string", description: "The complete, production-ready React component source code using Tailwind CSS" },
              explanation: { type: "string", description: "3-4 sentences explaining what the component does and how to use it" },
              dependencies: {
                type: "array",
                items: { type: "string" },
                description: "List of npm packages required (e.g., ['react', 'lucide-react'])"
              }
            },
            required: ["file_name", "file_path", "code", "explanation", "dependencies"]
          }
        }
      ],
      // Force Claude to use our specific structured output tool
      tool_choice: { type: "tool", name: "output_code_result" }
    })

    // 4. Extract and Validate with Zod
    const toolCall = message.content.find(block => block.type === 'tool_use')
    if (!toolCall || toolCall.type !== 'tool_use') {
      throw new Error('Claude failed to return a structured tool call.')
    }

    // Zod throws an error if the schema doesn't match perfectly, ensuring 100% type safety
    const validatedResult = CodeResultSchema.parse(toolCall.input)

    return NextResponse.json(validatedResult)

  } catch (error: any) {
    console.error('generate-code failed:', error)
    
    // Zod validation errors (hallucinated structure)
    if (error instanceof z.ZodError) {
       return NextResponse.json(
        { error: 'AI generated invalid structure. Zod validation failed.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message ?? 'Failed to generate code. Please try again.' },
      { status: 500 }
    )
  }
}
