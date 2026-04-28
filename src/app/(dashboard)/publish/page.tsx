'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STEPS = ['Creating repository…', 'Pushing README…', 'Creating issues…', 'Setting topics & description…', 'Publishing…']

export default function PublishPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<{ suggestion: any; plan: any } | null>(null)
  const [approvals, setApprovals] = useState({ repo: false, readme: false, commits: false })
  const [publishing, setPublishing] = useState(false)
  const [pubStep, setPubStep] = useState(-1)
  const [published, setPublished] = useState(false)
  const [activePreview, setActivePreview] = useState<'readme' | 'commits' | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rp_publish_draft')
      if (stored) setDraft(JSON.parse(stored))
    } catch {}
  }, [])

  const allApproved = approvals.repo && approvals.readme && approvals.commits

  async function handlePublish() {
    if (!allApproved) return
    setPublishing(true)
    for (let i = 0; i < STEPS.length; i++) {
      setPubStep(i)
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500))
    }
    setPublishing(false)
    setPublished(true)
    // Mark draft as published
    try {
      const drafts = JSON.parse(localStorage.getItem('rp_drafts') || '[]')
      const updated = drafts.map((d: any) =>
        d.plan?.repoName === draft?.plan?.repoName ? { ...d, status: 'PUBLISHED' } : d
      )
      localStorage.setItem('rp_drafts', JSON.stringify(updated))
    } catch {}
  }

  function copyReadme() {
    if (!draft?.plan?.readme) return
    navigator.clipboard.writeText(draft.plan.readme).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success state ───────────────────────────────────────────────────────
  if (published && draft) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title"><EmojiIcon emoji="🚀" className="inline" /> Published!</span>
        </div>
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }} className="fu d1">
            <div style={{ fontSize: 72, marginBottom: 20 }}><EmojiIcon emoji="🎉" className="inline" /></div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Project Published!
            </h1>
            <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 28 }}>
              <strong style={{ color: '#fff' }}>{draft.plan?.repoName}</strong> has been prepared for GitHub. Copy the README and commit messages to use in your repo.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`https://github.com/new?name=${draft.plan?.repoName}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                Open GitHub →
              </a>
              <Link href="/drafts" className="btn btn-ghost">View Drafts</Link>
              <Link href="/suggestions" className="btn btn-ghost">+ New Project</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── No draft state ─────────────────────────────────────────────────────
  if (!draft) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title"><EmojiIcon emoji="🚀" className="inline" /> Publish</span>
          <div className="topbar-right">
            <Link href="/drafts" className="btn btn-ghost btn-sm">View Drafts</Link>
          </div>
        </div>
        <div className="page-content fu d1" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}><EmojiIcon emoji="📭" className="inline" /></div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Nothing to publish yet</h2>
          <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
            Generate a project plan from the Suggestions page, then save it as a draft and click "Proceed to Publish".
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/suggestions" className="btn btn-primary" style={{ padding: '12px 28px' }}>Browse Suggestions →</Link>
            <Link href="/drafts" className="btn btn-ghost">Open Drafts</Link>
          </div>
        </div>
      </>
    )
  }

  const { suggestion, plan } = draft

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="🚀" className="inline" /> Publish to GitHub</span>
        <div className="topbar-right">
          <Link href="/drafts" className="btn btn-ghost btn-sm">← Drafts</Link>
          <button
            onClick={handlePublish}
            disabled={!allApproved || publishing}
            className="btn btn-primary btn-sm"
            style={{ background: allApproved ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : undefined, opacity: !allApproved || publishing ? 0.5 : 1, cursor: !allApproved ? 'not-allowed' : 'pointer' }}
          >
            {publishing ? '⟳ Publishing…' : '🚀 Publish Now'}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Publishing progress */}
        {publishing && (
          <div style={{ marginBottom: 28 }} className="card">
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Publishing in progress…</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, transition: 'all .3s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < pubStep ? 'var(--green)' : i === pubStep ? 'var(--blue)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0, transition: 'all .3s', boxShadow: i === pubStep ? '0 0 10px rgba(99,102,241,0.5)' : 'none' }}>
                    {i < pubStep ? '✓' : i === pubStep ? '→' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: i <= pubStep ? '#fff' : 'var(--dim)', transition: 'color .3s' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Left: approvals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }} className="fu d1">
              Review & Approve before publishing
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 8 }}>
              You must approve each section before the Publish button activates. Nothing goes to GitHub without your approval.
            </p>

            {/* Approve: Repo */}
            <div className="card fu d2" style={{ borderColor: approvals.repo ? 'rgba(52,211,153,0.3)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}><EmojiIcon emoji="📦" className="inline" /> Repository Details</div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Repo Name</div>
                    <code style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--sky)', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 8, display: 'inline-block' }}>{plan.repoName}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Description</div>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{plan.repoDescription}</p>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {suggestion.stack?.map((t: string) => <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', color: 'var(--sky)' }}>{t}</span>)}
                  </div>
                </div>
                <button
                  onClick={() => setApprovals(a => ({ ...a, repo: !a.repo }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: approvals.repo ? 'var(--green)' : 'rgba(255,255,255,0.06)', border: `2px solid ${approvals.repo ? 'var(--green)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}
                >{approvals.repo ? '✓' : ''}</button>
              </div>
            </div>

            {/* Approve: README */}
            <div className="card fu d3" style={{ borderColor: approvals.readme ? 'rgba(52,211,153,0.3)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}><EmojiIcon emoji="📄" className="inline" /> README.md</div>
                    <button onClick={() => setActivePreview(activePreview === 'readme' ? null : 'readme')} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>{activePreview === 'readme' ? 'Hide' : 'Preview'}</button>
                    <button onClick={copyReadme} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: copied ? 'var(--green)' : undefined }}>{copied ? '✓ Copied' : '⎘ Copy'}</button>
                  </div>
                  {activePreview === 'readme' && (
                    <pre style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: 14, borderRadius: 8, margin: '0 0 12px' }}>{plan.readme}</pre>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--gray)' }}>Professional README with setup instructions, tech stack, and features.</p>
                </div>
                <button
                  onClick={() => setApprovals(a => ({ ...a, readme: !a.readme }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: approvals.readme ? 'var(--green)' : 'rgba(255,255,255,0.06)', border: `2px solid ${approvals.readme ? 'var(--green)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}
                >{approvals.readme ? '✓' : ''}</button>
              </div>
            </div>

            {/* Approve: Commits */}
            <div className="card fu d4" style={{ borderColor: approvals.commits ? 'rgba(52,211,153,0.3)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}><EmojiIcon emoji="📝" className="inline" /> Commit Plan</div>
                    <button onClick={() => setActivePreview(activePreview === 'commits' ? null : 'commits')} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>{activePreview === 'commits' ? 'Hide' : 'Preview'}</button>
                  </div>
                  {activePreview === 'commits' && (
                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.commits?.map((c: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 9, color: 'var(--sky)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.order}</div>
                          <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray)', lineHeight: 1.5 }}>{c.message}</code>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--gray)' }}>{plan.commits?.length || 0} conventional commit messages ready to paste.</p>
                </div>
                <button
                  onClick={() => setApprovals(a => ({ ...a, commits: !a.commits }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: approvals.commits ? 'var(--green)' : 'rgba(255,255,255,0.06)', border: `2px solid ${approvals.commits ? 'var(--green)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}
                >{approvals.commits ? '✓' : ''}</button>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card fu d2" style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><EmojiIcon emoji={suggestion.emoji} /></div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{suggestion.name}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="badge badge-amber">{suggestion.difficulty}</span>
                <span className="badge badge-gray">{suggestion.estimatedDays}d</span>
                <span className="badge badge-blue">{suggestion.fitScore}% fit</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {Object.entries(approvals).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: val ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${val ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`, transition: 'all .2s' }}>
                    <span style={{ fontSize: 14 }}>{val ? '✅' : '⬜'}</span>
                    <span style={{ fontSize: 12, color: val ? 'var(--green)' : 'var(--gray)', fontWeight: val ? 600 : 400, textTransform: 'capitalize' }}>
                      {key === 'repo' ? 'Repository approved' : key === 'readme' ? 'README approved' : 'Commits approved'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handlePublish}
                disabled={!allApproved || publishing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: 12, background: allApproved ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : undefined, opacity: !allApproved ? 0.4 : 1, cursor: !allApproved ? 'not-allowed' : 'pointer', boxShadow: allApproved ? '0 0 24px rgba(99,102,241,0.3)' : 'none', transition: 'all .3s' }}
              >
                {publishing ? '⟳ Publishing…' : allApproved ? '🚀 Publish to GitHub' : `Approve all ${Object.values(approvals).filter(Boolean).length}/3 to publish`}
              </button>
            </div>

            <div className="card fu d3">
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>ℹ️ What happens when you publish</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['GitHub repo name and description are prepared', 'README.md is ready to paste', 'Commit messages are queued for copy', 'Nothing is sent without your approval'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--gray)', lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--sky)', flexShrink: 0 }}>→</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
