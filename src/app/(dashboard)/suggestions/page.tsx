'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SuggestionsPage() {
  const [streamedContent, setStreamedContent] = useState(() => {
    try {
      return localStorage.getItem('rp_ai_suggestions_md') || ''
    } catch {
      return ''
    }
  })
  const [generating, setGenerating] = useState(false)

  function getProfile() {
    try {
      const p = JSON.parse(localStorage.getItem('rp_onboarding') || '{}')
      return {
        who:       p.role       || 'developer',
        situation: p.goal       || 'building portfolio',
        time:      p.frequency  || '1 week',
        stack:     p.stack      || ['React', 'TypeScript', 'Tailwind CSS'],
        goal:      p.goal       || 'portfolio growth',
      }
    } catch {
      return { who: 'developer', situation: 'building portfolio', time: '1 week', stack: ['React', 'TypeScript', 'Tailwind CSS'], goal: 'portfolio growth' }
    }
  }

  async function runGenerate() {
    setGenerating(true)
    setStreamedContent('')
    try {
      const profile = getProfile()
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!res.ok) {
        alert('Failed to generate new suggestions.')
        setGenerating(false)
        return
      }

      if (!res.body) {
        setGenerating(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamedContent(fullText)
      }

      try {
        localStorage.setItem('rp_ai_suggestions_md', fullText)
      } catch {}

    } catch (err) {
      alert('Network error. Please try again later.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="💡" className="inline" /> Suggestions</span>
        <div className="topbar-right">
          <Link href="/quick-prompts" className="btn btn-ghost btn-sm"><EmojiIcon emoji="⚡" className="inline" /> Quick Prompts</Link>
          <button onClick={runGenerate} disabled={generating} className="btn btn-primary btn-sm">
            <EmojiIcon emoji="⚡" className="inline" /> {generating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 800, margin: '0 auto' }}>
        {streamedContent ? (
          <MarkdownSuggestions content={streamedContent} />
        ) : (
          <div className="card fu d1" style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:36, marginBottom:12 }}><EmojiIcon emoji="💡" className="inline" /></div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>No suggestions generated yet</div>
            <p style={{ fontSize:13, color:'var(--gray)', marginBottom: 24 }}>Click Generate to get AI-powered portfolio project ideas tailored to your profile.</p>
            <button onClick={runGenerate} disabled={generating} className="btn btn-primary">
              <EmojiIcon emoji="⚡" className="inline" /> Generate Now
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Lightweight markdown renderer ────────────────────────────────────────────
function MarkdownSuggestions({ content }: { content: string }) {
  const router = useRouter()

  function buildThisProject(projectName: string, projectDesc: string) {
    const suggestion = {
      name: projectName.replace(/^#+\s*/, '').replace(/[*_]/g, '').trim(),
      description: projectDesc,
      emoji: '💡',
      difficulty: 'INTERMEDIATE',
      estimatedDays: 7,
      fitScore: 85,
      stack: ['React', 'TypeScript', 'Tailwind CSS'],
      whyItFits: 'Selected from your AI suggestions',
    }
    try {
      localStorage.setItem('rp_selected_suggestion', JSON.stringify(suggestion))
    } catch {}
    const slug = suggestion.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    router.push(`/suggestions/${slug}`)
  }

  // Split markdown into sections by H2 (##) headings — each = one project card
  const sections = content.split(/(?=^##\s)/m).filter(s => s.trim())

  // If no ## headings, fall back to plain styled rendering
  if (!sections.some(s => s.startsWith('## '))) {
    return (
      <div className="card fu d1" style={{ padding: 28 }}>
        <RichMarkdown md={content} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map((section, i) => {
        const lines = section.split('\n')
        const titleLine = lines[0] || ''
        const projectName = titleLine.replace(/^#+\s*/, '').replace(/[*_]/g, '').trim()
        const bodyLines = lines.slice(1).join('\n')

        // Extract first non-blank line as description
        const firstParagraph = bodyLines.split(/\n\n/)[0]?.replace(/\n/g, ' ').trim() || ''

        return (
          <div key={i} className={`card card-hover fu d${(i % 3) + 1}`} style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
            {/* Subtle accent glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(34,211,238,.1))', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {['💡','🚀','⚡','🔥','🎯','🏆','🧩','📊','🌍','🔗'][i % 10]}
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                    {projectName}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sky)', background: 'rgba(34,211,238,.08)', border: '1px solid rgba(34,211,238,.2)', padding: '2px 10px', borderRadius: 100 }}>
                    Project {i + 1}
                  </span>
                </div>
              </div>
              <button
                onClick={() => buildThisProject(projectName, firstParagraph)}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', whiteSpace: 'nowrap' }}
              >
                Build this →
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 18 }}>
              <RichMarkdown md={bodyLines} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Simple but rich inline markdown renderer ─────────────────────────────────
function RichMarkdown({ md }: { md: string }) {
  const lines = md.split('\n')
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []
  let keyIdx = 0

  function flushList() {
    if (listBuffer.length === 0) return
    elements.push(
      <ul key={keyIdx++} style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {listBuffer.map((item, ii) => (
          <li key={ii} style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
            <InlineMarkdown text={item} />
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine

    if (/^###\s/.test(line)) {
      flushList()
      elements.push(<div key={keyIdx++} style={{ fontSize: 12, fontWeight: 700, color: 'var(--sky)', textTransform: 'uppercase', letterSpacing: '0.7px', marginTop: 16, marginBottom: 6 }}><InlineMarkdown text={line.replace(/^###\s/, '')} /></div>)
    } else if (/^##\s/.test(line)) {
      flushList()
      elements.push(<div key={keyIdx++} style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 20, marginBottom: 8 }}><InlineMarkdown text={line.replace(/^##\s/, '')} /></div>)
    } else if (/^#\s/.test(line)) {
      flushList()
      elements.push(<div key={keyIdx++} style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 10 }}><InlineMarkdown text={line.replace(/^#\s/, '')} /></div>)
    } else if (/^[-*]\s/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s/, ''))
    } else if (/^---+$/.test(line.trim())) {
      flushList()
      elements.push(<hr key={keyIdx++} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.08)', margin: '16px 0' }} />)
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(<p key={keyIdx++} style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.75, margin: '4px 0' }}><InlineMarkdown text={line} /></p>)
    }
  }
  flushList()
  return <>{elements}</>
}

function InlineMarkdown({ text }: { text: string }) {
  // Handle **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
        if (/^\*[^*]+\*$/.test(part))   return <em key={i} style={{ color: 'var(--text)', fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
        if (/^`[^`]+`$/.test(part))     return <code key={i} style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--sky)', background: 'rgba(34,211,238,.08)', padding: '1px 7px', borderRadius: 5 }}>{part.slice(1, -1)}</code>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
