'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Draft {
  id: string
  savedAt: string
  status: 'DRAFT' | 'PUBLISHED'
  suggestion: {
    name: string
    emoji: string
    difficulty: string
    estimatedDays: number
    fitScore: number
    stack: string[]
  }
  plan: {
    repoName: string
    repoDescription: string
    features: { name: string; priority: string }[]
    roadmap: { phase: number; title: string }[]
    readme: string
    commits: { order: number; message: string }[]
  }
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rp_drafts')
      if (stored) setDrafts(JSON.parse(stored))
    } catch {}
  }, [])

  function deleteDraft(id: string) {
    const updated = drafts.filter(d => d.id !== id)
    setDrafts(updated)
    try { localStorage.setItem('rp_drafts', JSON.stringify(updated)) } catch {}
    setDeleteId(null)
  }

  function openDraft(draft: Draft) {
    try {
      localStorage.setItem('rp_selected_suggestion', JSON.stringify(draft.suggestion))
      localStorage.setItem('rp_publish_draft', JSON.stringify({ suggestion: draft.suggestion, plan: draft.plan }))
    } catch {}
    router.push(`/suggestions/${draft.suggestion.name?.toLowerCase().replace(/\s+/g, '-') || 'draft'}`)
  }

  function proceedToPublish(draft: Draft) {
    try { localStorage.setItem('rp_publish_draft', JSON.stringify({ suggestion: draft.suggestion, plan: draft.plan })) } catch {}
    router.push('/publish')
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="📁" className="inline" /> Drafts</span>
        <div className="topbar-right">
          <Link href="/suggestions" className="btn btn-primary btn-sm">+ New Project</Link>
        </div>
      </div>

      <div className="page-content">
        {drafts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }} className="fu d1">
            <div style={{ fontSize: 64, marginBottom: 20 }}><EmojiIcon emoji="📁" className="inline" /></div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>No drafts yet</h2>
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
              When you generate a project plan and click "Save Draft", it will appear here for you to review and publish.
            </p>
            <Link href="/suggestions" className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 12 }}>
              Browse project suggestions →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fu d1">
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 4 }}>{drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved</div>
            {drafts.map((draft, i) => (
              <div key={draft.id} className="card card-hover" style={{ padding: 24, animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Emoji */}
                  <div style={{ fontSize: 36, flexShrink: 0 }}><EmojiIcon emoji={draft.suggestion.emoji} /></div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>{draft.suggestion.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: draft.status === 'PUBLISHED' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${draft.status === 'PUBLISHED' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`, color: draft.status === 'PUBLISHED' ? 'var(--green)' : 'var(--amber)' }}>{draft.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--sky)', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', padding: '2px 10px', borderRadius: 6 }}>{draft.plan?.repoName}</code>
                      <span className="badge badge-amber">{draft.suggestion.difficulty}</span>
                      <span className="badge badge-gray">{draft.suggestion.estimatedDays}d</span>
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 12 }}>{draft.plan?.repoDescription}</p>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {draft.plan?.features?.slice(0, 4).map(f => (
                        <span key={f.name} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--gray)' }}>{f.name}</span>
                      ))}
                      {draft.plan?.features?.length > 4 && <span style={{ fontSize: 10, color: 'var(--dim)' }}>+{draft.plan.features.length - 4} more</span>}
                    </div>

                    <div style={{ fontSize: 10, color: 'var(--dim)' }}>Saved {new Date(draft.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => openDraft(draft)} className="btn btn-ghost btn-sm">✏️ Open</button>
                    <button onClick={() => proceedToPublish(draft)} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}><EmojiIcon emoji="🚀" className="inline" /> Publish</button>
                    <button onClick={() => setDeleteId(draft.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(248,113,113,0.2)', fontSize: 11 }}><EmojiIcon emoji="🗑" className="inline" /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 380, width: '100%', padding: 28 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 10 }}>⚠️ Delete draft?</div>
            <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 22 }}>This will permanently remove the draft and all its generated content. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(248,113,113,0.12)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.25)' }} onClick={() => deleteDraft(deleteId)}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
