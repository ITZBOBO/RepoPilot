'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Tag Input component ──────────────────────────────────────────────────────
function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput('')
  }

  function remove(tag: string) { onChange(value.filter(t => t !== tag)) }

  return (
    <div style={{ border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'6px 10px', background:'rgba(255,255,255,.03)', display:'flex', flexWrap:'wrap', gap:6, minHeight:42, alignItems:'center' }}>
      {value.map(tag => (
        <span key={tag} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.25)', borderRadius:100, padding:'3px 10px', fontSize:12, color:'#c4b5fd' }}>
          {tag}
          <button onClick={() => remove(tag)} style={{ background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontSize:12, lineHeight:1, padding:0 }}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
        placeholder={value.length === 0 ? placeholder : 'Add more…'}
        style={{ flex:1, minWidth:80, background:'none', border:'none', outline:'none', fontSize:13, color:'#fff', padding:'2px 4px' }}
      />
    </div>
  )
}

// ─── Markdown renderer (basic) ────────────────────────────────────────────────
function MarkdownPreview({ content }: { content: string }) {
  // Convert markdown to safe HTML preview
  const html = content
    .replace(/^### (.+)$/gm, '<h3 style="color:#c4b5fd;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="color:#e2e8f0;font-size:18px;margin:24px 0 10px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:8px">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 16px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
    .replace(/`(.+?)`/g,      '<code style="background:rgba(255,255,255,.08);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:#86efac">$1</code>')
    .replace(/^- (.+)$/gm,   '<li style="color:#94a3b8;margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="color:#94a3b8;margin:4px 0">$2</li>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px;font-family:monospace;font-size:12px;color:#86efac;overflow-x:auto;margin:12px 0"><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p style="color:#94a3b8;line-height:1.7;margin:8px 0">')
    .replace(/^\s*$/gm, '')

  return (
    <div
      style={{ fontSize:14, lineHeight:1.8, color:'#94a3b8' }}
      dangerouslySetInnerHTML={{ __html: `<p style="color:#94a3b8;line-height:1.7;margin:8px 0">${html}</p>` }}
    />
  )
}

// ─── Cron presets ─────────────────────────────────────────────────────────────
const SCHEDULE_PRESETS = [
  { label:'Every day at 9am',       value:'0 9 * * *'     },
  { label:'Every day at 6pm',       value:'0 18 * * *'    },
  { label:'Weekdays only at 10am',  value:'0 10 * * 1-5'  },
  { label:'Every day at noon',      value:'0 12 * * *'    },
  { label:'Custom…',                value:'custom'         },
]

const LANGUAGES = ['JavaScript','TypeScript','Python','Go','Rust','Java','C#','Ruby','PHP','Swift']

export default function ReadmePage() {
  const [form, setForm] = useState({
    projectName:  '',
    description:  '',
    stack:        [] as string[],
    features:     [] as string[],
    hasLiveDemo:  false,
    liveUrl:      '',
    installSteps: '',
  })

  const [generating, setGenerating] = useState(false)
  const [markdown, setMarkdown]     = useState('')
  const [error, setError]           = useState('')
  const [copied, setCopied]         = useState(false)
  const [activeView, setActiveView] = useState<'raw'|'preview'>('preview')

  // Pre-fill from localStorage if coming from Suggestions
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rp_readme_prefill')
      if (stored) {
        const data = JSON.parse(stored)
        setForm(f => ({
          ...f,
          projectName: data.name  ?? f.projectName,
          description: data.description ?? f.description,
          stack:       Array.isArray(data.stack) ? data.stack : f.stack,
          features:    Array.isArray(data.features) ? data.features : f.features,
        }))
        localStorage.removeItem('rp_readme_prefill')
      }
    } catch {}
  }, [])

  const isValid = form.projectName.trim().length > 0

  async function handleGenerate() {
    if (!isValid) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate.')
      setMarkdown(data.markdown)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadReadme() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'README.md'; a.click()
    URL.revokeObjectURL(url)
  }

  function field(label: string, input: React.ReactNode, hint?: string) {
    return (
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>{label}</label>
        {input}
        {hint && <p style={{ fontSize:11, color:'var(--dim)', marginTop:4 }}>{hint}</p>}
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="📄" className="inline" /> README Generator</span>
        <div className="topbar-right">
          <Link href="/suggestions" className="btn btn-ghost btn-sm">← Suggestions</Link>
        </div>
      </div>

      <div className="page-content" style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:24, height:'calc(100vh - 64px)', overflowY:'auto' }}>

        {/* ── Left: Form ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:18, paddingBottom:32 }}>
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:4 }}>Project Details</div>

            {field('Project Name',
              <input
                className="input"
                placeholder="e.g. Finance Dashboard"
                value={form.projectName}
                onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
              />
            )}

            {field('Description',
              <textarea
                className="input"
                rows={3}
                placeholder="Briefly describe what your project does..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize:'vertical', minHeight:72 }}
              />
            )}

            {field('Tech Stack',
              <TagInput value={form.stack} onChange={v => setForm(f => ({ ...f, stack: v }))} placeholder="React, TypeScript, Tailwind… press Enter" />,
              'Press Enter or comma to add each technology'
            )}

            {field('Key Features',
              <TagInput value={form.features} onChange={v => setForm(f => ({ ...f, features: v }))} placeholder="User auth, Dashboard charts… press Enter" />,
              'Press Enter or comma to add each feature'
            )}

            {/* Live demo toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Live Demo</div>
                <div style={{ fontSize:11, color:'var(--dim)' }}>Include a demo link in the README</div>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, hasLiveDemo: !f.hasLiveDemo }))}
                style={{ width:40, height:22, borderRadius:100, background: form.hasLiveDemo ? 'var(--blue)' : 'rgba(255,255,255,.08)', border:'none', position:'relative', cursor:'pointer', transition:'background .2s' }}
              >
                <span style={{ position:'absolute', top:3, left: form.hasLiveDemo ? 20 : 3, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
              </button>
            </div>

            {form.hasLiveDemo && field('Live Demo URL',
              <input
                className="input"
                placeholder="https://your-app.vercel.app"
                value={form.liveUrl}
                onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))}
              />
            )}

            {field('Install Notes (optional)',
              <textarea
                className="input"
                rows={2}
                placeholder="e.g. Requires Node 18+, add a .env file with..."
                value={form.installSteps}
                onChange={e => setForm(f => ({ ...f, installSteps: e.target.value }))}
                style={{ resize:'vertical' }}
              />
            )}
          </div>

          {error && (
            <div style={{ background:'rgba(248,113,113,.07)', border:'1px solid rgba(248,113,113,.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--red)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="generate-readme-btn"
            onClick={handleGenerate}
            disabled={!isValid || generating}
            className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:14, opacity: !isValid ? 0.5 : 1 }}
          >
            {generating ? (
              <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Generating README…</>
            ) : '✦ Generate README'}
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:0, minHeight:0 }}>
          {markdown ? (
            <div className="card" style={{ display:'flex', flexDirection:'column', flex:1, padding:0, overflow:'hidden' }}>
              {/* Output toolbar */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                <div style={{ display:'flex', gap:4 }}>
                  {(['preview','raw'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setActiveView(v)}
                      style={{ padding:'5px 14px', borderRadius:7, background: activeView===v ? 'rgba(99,102,241,.2)' : 'transparent', border:`1px solid ${activeView===v ? 'rgba(99,102,241,.35)' : 'transparent'}`, fontSize:12, color: activeView===v ? '#c4b5fd' : 'var(--dim)', cursor:'pointer', textTransform:'capitalize' }}
                    >{v === 'raw' ? 'Raw Markdown' : 'Preview'}</button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={copyToClipboard} className="btn btn-ghost btn-sm">
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={downloadReadme} className="btn btn-primary btn-sm">
                    ↓ Download README.md
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
                {activeView === 'raw' ? (
                  <pre style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'#94a3b8', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>
                    {markdown}
                  </pre>
                ) : (
                  <MarkdownPreview content={markdown} />
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:16, opacity:0.6 }}>
              <div style={{ fontSize:48 }}><EmojiIcon emoji="📄" className="inline" /></div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>Your README will appear here</div>
              <p style={{ fontSize:13, color:'var(--gray)', textAlign:'center', maxWidth:320, lineHeight:1.6 }}>
                Fill in the project details on the left and click Generate README to create a production-quality README.md.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
