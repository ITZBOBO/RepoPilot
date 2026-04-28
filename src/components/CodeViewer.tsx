'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useCallback } from 'react'

// ─── Lightweight token-based syntax highlighter ────────────────────────────
// No external lib needed — uses regex tokens with CSS colors matching the space theme.
function highlight(code: string): string {
  // We build token spans in order of priority
  const tokens: Array<{ pattern: RegExp; cls: string }> = [
    // Comments
    { pattern: /\/\/[^\n]*/g, cls: 'tok-comment' },
    { pattern: /\/\*[\s\S]*?\*\//g, cls: 'tok-comment' },
    // JSX/TSX strings (template literals)
    { pattern: /`[^`]*`/g, cls: 'tok-string' },
    // Regular strings
    { pattern: /"(?:[^"\\]|\\.)*"/g, cls: 'tok-string' },
    { pattern: /'(?:[^'\\]|\\.)*'/g, cls: 'tok-string' },
    // Keywords
    { pattern: /\b(import|export|default|from|const|let|var|return|if|else|for|while|function|class|interface|type|extends|implements|new|typeof|instanceof|void|async|await|try|catch|throw|of|in|switch|case|break|continue)\b/g, cls: 'tok-keyword' },
    // React / TS keywords
    { pattern: /\b(React|useState|useEffect|useCallback|useMemo|useRef|Fragment|JSX)\b/g, cls: 'tok-builtin' },
    // Types
    { pattern: /\b(string|number|boolean|null|undefined|never|any|object|Symbol|Promise|Array|Record|Partial|Required)\b/g, cls: 'tok-type' },
    // Boolean / null
    { pattern: /\b(true|false|null|undefined)\b/g, cls: 'tok-literal' },
    // Numbers
    { pattern: /\b\d+(\.\d+)?\b/g, cls: 'tok-number' },
    // JSX tags
    { pattern: /<\/?[A-Z][a-zA-Z]*/g, cls: 'tok-tag' },
    { pattern: /<\/?[a-z]+/g, cls: 'tok-htmltag' },
    // Props / attributes
    { pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*=)/g, cls: 'tok-attr' },
    // Function calls
    { pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, cls: 'tok-fn' },
  ]

  // We do a single-pass replacement using a placeholder approach
  const PLACEHOLDER = '\x00SPAN\x00'
  const spans: string[] = []

  let work = code

  // Replace each token pattern with a placeholder
  for (const { pattern, cls } of tokens) {
    work = work.replace(pattern, match => {
      const idx = spans.length
      // Escape HTML only inside the span content
      const escaped = match.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      spans.push(`<span class="${cls}">${escaped}</span>`)
      return `${PLACEHOLDER}${idx}${PLACEHOLDER}`
    })
  }

  // Escape remaining HTML in non-token text
  work = work.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

  // Restore spans
  work = work.replace(new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, 'g'), (_, idx) => spans[parseInt(idx)])

  return work
}

// ─── Types ─────────────────────────────────────────────────────────────────
export interface GeneratedCode {
  file_name: string
  file_path: string
  code: string
  explanation: string
  dependencies: string[]
}

interface CodeViewerProps {
  result: GeneratedCode
  onRegenerate: () => void
  regenerating: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function CodeViewer({ result, onRegenerate, regenerating }: CodeViewerProps) {
  const [tab, setTab] = useState<'code' | 'explanation'>('code')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = result.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result.code])

  const handleDownload = useCallback(() => {
    const blob = new Blob([result.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.file_name
    a.click()
    URL.revokeObjectURL(url)
  }, [result.code, result.file_name])

  const highlighted = highlight(result.code)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* File Header */}
      <div style={{
        padding: '14px 20px',
        background: 'rgba(10,14,28,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
            <EmojiIcon emoji="📄" className="inline" /> {result.file_name}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--dim)' }}>
            {result.file_path}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: copied ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
              border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: copied ? 'var(--green)' : 'var(--text)',
              transition: 'all .2s',
            }}
          >
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text)', transition: 'all .2s',
            }}
          >
            ⬇ Download
          </button>

          <button
            onClick={onRegenerate}
            disabled={regenerating}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: regenerating ? 'not-allowed' : 'pointer',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: regenerating ? 'var(--dim)' : 'var(--sky)', transition: 'all .2s', opacity: regenerating ? 0.6 : 1
            }}
          >
            {regenerating ? '⟳ Generating…' : '↺ Regenerate'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,14,28,0.4)',
        flexShrink: 0
      }}>
        {(['code', 'explanation'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--dim)',
              fontSize: 12, fontWeight: tab === t ? 700 : 400,
              borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent',
              transition: 'all .15s',
            }}
          >
            {t === 'code' ? '⌨ Code' : '📖 Explanation'}
          </button>
        ))}

        {/* Dependencies */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px' }}>
          {result.dependencies.map(dep => (
            <span key={dep} style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)',
              color: 'var(--sky)'
            }}>{dep}</span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {tab === 'code' ? (
          <pre
            style={{
              margin: 0, padding: '24px', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: 13, lineHeight: 1.7, color: '#CBD5E1',
              background: 'transparent', minHeight: '100%',
              whiteSpace: 'pre', overflowX: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        ) : (
          <div style={{ padding: '28px 32px', maxWidth: 680 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              About this component
            </h3>
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
              {result.explanation}
            </p>

            <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sky)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}><EmojiIcon emoji="📍" className="inline" /> Where to place it</div>
              <code style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text)' }}>{result.file_path}</code>
            </div>

            <div style={{ marginTop: 16, padding: 16, background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}><EmojiIcon emoji="📦" className="inline" /> Dependencies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.dependencies.map(dep => (
                  <code key={dep} style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6 }}>{dep}</code>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 16, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}><EmojiIcon emoji="🚀" className="inline" /> How to use</div>
              <pre style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
{`import ${result.file_name.replace('.tsx', '').replace('.ts', '')} from '${result.file_path.replace('.tsx', '').replace('.ts', '')}'

// Then use it in your JSX:
<${result.file_name.replace('.tsx', '').replace('.ts', '')} />`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
