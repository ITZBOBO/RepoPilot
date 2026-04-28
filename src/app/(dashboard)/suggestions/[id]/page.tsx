'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────
interface Feature { name: string; description: string; priority: 'MUST' | 'SHOULD' | 'NICE' }
interface Phase   { phase: number; title: string; days: string; tasks: string[] }
interface Commit  { order: number; message: string }
interface Day     { day: string; focus: string }

interface Plan {
  overview: string
  targetAudience: string
  designDirection: string
  features: Feature[]
  advancedFeatures: string[]
  techStack: { framework: string; styling: string; extras: string[] }
  roadmap: Phase[]
  repoName: string
  repoDescription: string
  folderStructure: string
  readme: string
  commits: Commit[]
  timeline: Day[]
}

const PRIORITY_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  MUST:  { color: 'var(--green)',  bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  SHOULD:{ color: 'var(--amber)',  bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  NICE:  { color: 'var(--purple)', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
}

// ─── Loading animation ────────────────────────────────────────────────
const GEN_STEPS = [
  'Analysing your project idea…',
  'Planning features and roadmap…',
  'Generating README and docs…',
  'Writing commit strategy…',
  'Finalising your build plan…',
]

export default function SuggestionStrategyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [genStep, setGenStep] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'roadmap' | 'repo'>('overview')
  const [savedDraft, setSavedDraft] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load the suggestion from localStorage (set when user clicks "Build this →")
  const [suggestion, setSuggestion] = useState<any>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rp_selected_suggestion')
      if (stored) setSuggestion(JSON.parse(stored))
    } catch {}
  }, [])

  async function generatePlan() {
    if (!suggestion) return
    setLoading(true)
    setError(null)
    setGenStep(0)

    const iv = setInterval(() => {
      setGenStep(s => (s < GEN_STEPS.length - 1 ? s + 1 : s))
    }, 900)

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle:  suggestion.name,
          description:   suggestion.description,
          stack:         suggestion.stack,
          difficulty:    suggestion.difficulty,
          estimatedDays: suggestion.estimatedDays,
          goal:          'portfolio growth',
          whyItFits:     suggestion.whyItFits,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed')
      setPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      clearInterval(iv)
      setGenStep(GEN_STEPS.length - 1)
      setTimeout(() => { setLoading(false); setGenStep(-1) }, 500)
    }
  }

  function saveDraft() {
    if (!plan || !suggestion) return
    try {
      const drafts = JSON.parse(localStorage.getItem('rp_drafts') || '[]')
      const draft = {
        id: `draft_${Date.now()}`,
        savedAt: new Date().toISOString(),
        suggestion,
        plan,
        status: 'DRAFT',
      }
      drafts.unshift(draft)
      localStorage.setItem('rp_drafts', JSON.stringify(drafts.slice(0, 20)))
      setSavedDraft(true)
      setTimeout(() => setSavedDraft(false), 3000)
    } catch {}
  }

  function copyReadme() {
    if (!plan?.readme) return
    navigator.clipboard.writeText(plan.readme).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function proceedToPublish() {
    if (!plan || !suggestion) return
    try {
      localStorage.setItem('rp_publish_draft', JSON.stringify({ suggestion, plan }))
    } catch {}
    router.push('/publish')
  }

  // ── No suggestion stored ─────────────────────────────────────────────
  if (!suggestion) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title"><EmojiIcon emoji="💡" className="inline" /> Project Strategy</span>
          <div className="topbar-right">
            <Link href="/suggestions" className="btn btn-ghost btn-sm">← Back to Suggestions</Link>
          </div>
        </div>
        <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}><EmojiIcon emoji="🤔" className="inline" /></div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, color: '#fff', marginBottom: 12 }}>No project selected</h2>
          <p style={{ color: 'var(--gray)', marginBottom: 24 }}>Go back to Suggestions and click "Build this →" on a project idea.</p>
          <Link href="/suggestions" className="btn btn-primary">View Suggestions</Link>
        </div>
      </>
    )
  }

  // ── Loading overlay ──────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title"><EmojiIcon emoji="✨" className="inline" /> Generating your plan…</span>
        </div>
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <div style={{ fontSize: 56, marginBottom: 24, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Building your project plan
            </h2>
            <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 32 }}>
              Claude is generating features, roadmap, README, and commit strategy for <strong style={{ color: '#fff' }}>{suggestion.name}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GEN_STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: i <= genStep ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i <= genStep ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)'}`, transition: 'all .4s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < genStep ? 'var(--green)' : i === genStep ? 'var(--blue)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0, boxShadow: i === genStep ? '0 0 10px rgba(99,102,241,0.5)' : 'none', transition: 'all .4s' }}>
                    {i < genStep ? '✓' : i === genStep ? '→' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: i <= genStep ? '#fff' : 'var(--dim)', transition: 'color .4s' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}><EmojiIcon emoji={suggestion.emoji} /></span>
          <div>
            <span className="topbar-title" style={{ fontSize: 16 }}>{suggestion.name}</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
              <span className={`badge ${suggestion.difficulty === 'BEGINNER' ? 'badge-green' : suggestion.difficulty === 'ADVANCED' ? 'badge-purple' : 'badge-amber'}`}>{suggestion.difficulty}</span>
              <span className="badge badge-gray">{suggestion.estimatedDays} days</span>
              <span className="badge badge-blue">{suggestion.fitScore}% fit</span>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <Link href="/suggestions" className="btn btn-ghost btn-sm">← Suggestions</Link>
          {plan && (
            <>
              <button onClick={saveDraft} className={`btn btn-ghost btn-sm ${savedDraft ? 'btn-success' : ''}`} style={{ color: savedDraft ? 'var(--green)' : undefined, borderColor: savedDraft ? 'rgba(52,211,153,0.3)' : undefined }}>
                {savedDraft ? '✓ Saved to Drafts!' : '💾 Save Draft'}
              </button>
              <button onClick={proceedToPublish} className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}>
                <EmojiIcon emoji="🚀" className="inline" /> Proceed to Publish
              </button>
            </>
          )}
        </div>
      </div>

      <div className="page-content">
        {/* Not yet generated */}
        {!plan && !error && (
          <div className="fu d1" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}><EmojiIcon emoji={suggestion.emoji} /></div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{suggestion.name}</h1>
            <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 16 }}>{suggestion.description}</p>
            <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 32, fontSize: 13, color: 'var(--sky)', textAlign: 'left' }}>
              <EmojiIcon emoji="💡" className="inline" /> <strong>Why it fits you:</strong> {suggestion.whyItFits}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              {suggestion.stack?.map((t: string) => (
                <span key={t} style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 12, color: 'var(--sky)', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <button onClick={generatePlan} className="btn btn-primary" style={{ padding: '16px 48px', fontSize: 16, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
              <EmojiIcon emoji="✨" className="inline" /> Generate Full Project Plan
            </button>
            <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 12 }}>Claude will create features, roadmap, README, and commits for you</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ color: 'var(--red)', marginBottom: 8 }}>Generation failed</h3>
            <p style={{ color: 'var(--gray)', marginBottom: 24 }}>{error}</p>
            <button onClick={generatePlan} className="btn btn-primary">↺ Try Again</button>
          </div>
        )}

        {/* Plan ready */}
        {plan && (
          <div className="fu d1">
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 28, background: 'rgba(10,14,28,0.4)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
              {(['overview', 'features', 'roadmap', 'repo'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: activeTab === tab ? 700 : 400, cursor: 'pointer', background: activeTab === tab ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--dim)', transition: 'all .15s' }}>
                  {tab === 'overview' ? '📋 Overview' : tab === 'features' ? '✨ Features' : tab === 'roadmap' ? '🗺️ Roadmap' : '📦 Repo & README'}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}><EmojiIcon emoji="📋" className="inline" /> Project Overview</div>
                    <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.8 }}>{plan.overview}</p>
                  </div>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}><EmojiIcon emoji="🎯" className="inline" /> Target Audience</div>
                    <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>{plan.targetAudience}</p>
                  </div>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}><EmojiIcon emoji="🎨" className="inline" /> Design Direction</div>
                    <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>{plan.designDirection}</p>
                  </div>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}><EmojiIcon emoji="📅" className="inline" /> Timeline</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.timeline.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', padding: '3px 10px', borderRadius: 100, flexShrink: 0, whiteSpace: 'nowrap' }}>{d.day}</div>
                          <div style={{ fontSize: 13, color: 'var(--text)', paddingTop: 2 }}>{d.focus}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}><EmojiIcon emoji="🛠" className="inline" /> Tech Stack</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div><div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Framework</div>
                        <span style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12, color: 'var(--blue-light)', fontWeight: 600 }}>{plan.techStack.framework}</span></div>
                      <div><div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Styling</div>
                        <span style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 12, color: 'var(--sky)', fontWeight: 600 }}>{plan.techStack.styling}</span></div>
                      {plan.techStack.extras?.length > 0 && (
                        <div><div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Extras</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {plan.techStack.extras.map(e => <span key={e} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'var(--gray)' }}>{e}</span>)}
                          </div></div>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}><EmojiIcon emoji="📁" className="inline" /> Folder Structure</div>
                    <pre style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{plan.folderStructure}</pre>
                  </div>

                  <div className="card" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}><EmojiIcon emoji="🚀" className="inline" /> Next Steps</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={saveDraft} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}><EmojiIcon emoji="💾" className="inline" /> Save as Draft</button>
                      <button onClick={() => setActiveTab('repo')} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', gap: 8 }}><EmojiIcon emoji="📄" className="inline" /> View README</button>
                      <button onClick={proceedToPublish} className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start', gap: 8, background: 'linear-gradient(135deg,#6366F1,#22D3EE)' }}><EmojiIcon emoji="🚀" className="inline" /> Proceed to Publish</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Features Tab ── */}
            {activeTab === 'features' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                  {plan.features.map((f, i) => {
                    const style = PRIORITY_STYLE[f.priority] || PRIORITY_STYLE.NICE
                    return (
                      <div key={i} className="card card-hover" style={{ borderColor: style.border, background: style.bg }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>{f.name}</div>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 100, color: style.color, background: `${style.color}18`, border: `1px solid ${style.border}`, flexShrink: 0, marginLeft: 8 }}>{f.priority}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.6, margin: 0 }}>{f.description}</p>
                      </div>
                    )
                  })}
                </div>
                {plan.advancedFeatures?.length > 0 && (
                  <div className="card" style={{ background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.15)' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>⭐ Advanced / Optional Features</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {plan.advancedFeatures.map((f, i) => (
                        <span key={i} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', fontSize: 12, color: 'var(--purple)' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Roadmap Tab ── */}
            {activeTab === 'roadmap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {plan.roadmap.map((phase, i) => (
                  <div key={i} className="card" style={{ borderLeft: '3px solid var(--blue)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{phase.phase}</div>
                      <div>
                        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>{phase.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--sky)', marginTop: 2 }}>{phase.days}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {phase.tasks.map((task, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--blue)', flexShrink: 0 }}>◆</div>
                          <span style={{ fontSize: 13, color: 'var(--text)' }}>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Repo & README Tab ── */}
            {activeTab === 'repo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                <div>
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}><EmojiIcon emoji="📄" className="inline" /> README.md</div>
                      <button onClick={copyReadme} className="btn btn-ghost btn-sm" style={{ color: copied ? 'var(--green)' : undefined }}>
                        {copied ? '✓ Copied!' : '⎘ Copy'}
                      </button>
                    </div>
                    <pre style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 480, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 10, margin: 0 }}>{plan.readme}</pre>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}><EmojiIcon emoji="📦" className="inline" /> Repo Details</div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Repo Name</div>
                      <code style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--sky)', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 8, display: 'block' }}>{plan.repoName}</code>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Description</div>
                      <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{plan.repoDescription}</p>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}><EmojiIcon emoji="📝" className="inline" /> Commit Plan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.commits.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 9, color: 'var(--sky)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.order}</div>
                          <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray)', lineHeight: 1.5 }}>{c.message}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={proceedToPublish} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', fontSize: 14 }}>
                    <EmojiIcon emoji="🚀" className="inline" /> Proceed to Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
