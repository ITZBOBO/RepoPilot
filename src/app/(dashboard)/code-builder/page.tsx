'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import CodeViewer, { GeneratedCode } from '@/components/CodeViewer'

// ─── Feature definitions ────────────────────────────────────────────────────
const FEATURES = [
  { id: 'navbar',         label: 'Navbar',            icon: '🔝', desc: 'Responsive navigation bar' },
  { id: 'hero',           label: 'Hero Section',       icon: '🦸', desc: 'Landing page hero with CTA' },
  { id: 'cards',          label: 'Card Grid',          icon: '🃏', desc: 'Reusable card component grid' },
  { id: 'form',           label: 'Contact Form',       icon: '📝', desc: 'Validated contact/login form' },
  { id: 'footer',         label: 'Footer',             icon: '🔗', desc: 'Site-wide footer with links' },
  { id: 'sidebar',        label: 'Sidebar',            icon: '⬛', desc: 'Collapsible navigation sidebar' },
  { id: 'modal',          label: 'Modal Dialog',       icon: '🪟', desc: 'Accessible modal/popup' },
  { id: 'table',          label: 'Data Table',         icon: '📊', desc: 'Sortable, paginated table' },
  { id: 'toast',          label: 'Toast Notifications',icon: '🍞', desc: 'Auto-dismiss notification system' },
  { id: 'tabs',           label: 'Tabs Component',     icon: '📑', desc: 'Animated tabs with panels' },
  { id: 'avatar',         label: 'User Avatar',        icon: '👤', desc: 'Avatar with fallback initials' },
  { id: 'search',         label: 'Search Bar',         icon: '🔍', desc: 'Debounced search with results' },
  { id: 'pagination',     label: 'Pagination',         icon: '📄', desc: 'Page navigation component' },
  { id: 'badge',          label: 'Badges & Pills',     icon: '🏷️', desc: 'Status badge variants' },
  { id: 'dark-toggle',    label: 'Dark Mode Toggle',   icon: '🌙', desc: 'Smooth dark/light mode switch' },
  { id: 'progress-bar',   label: 'Progress Bar',       icon: '⏳', desc: 'Animated progress indicator' },
]

const STACKS = ['React', 'Tailwind CSS', 'TypeScript']
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

type Level = typeof LEVELS[number]

// ─── Empty state component ──────────────────────────────────────────────────
function EmptyState({ onPick }: { onPick: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.4))' }}><EmojiIcon emoji="⚡" className="inline" /></div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
        Select a feature to generate code
      </h3>
      <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 320, marginBottom: 28 }}>
        Click any feature from the list to instantly generate a clean, production-ready React + Tailwind component.
      </p>
      <button
        onClick={onPick}
        className="btn btn-primary"
        style={{ padding: '10px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #22D3EE)' }}
      >
        ← Pick a feature
      </button>
    </div>
  )
}

// ─── Loading skeleton ───────────────────────────────────────────────────────
function LoadingSkeleton({ feature }: { feature: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.2))',
        border: '2px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 24,
        animation: 'spin 1.5s linear infinite',
      }}>⚙️</div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Generating {feature}…
      </h3>
      <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 32 }}>
        Claude is writing clean, production-ready code for you
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 500 }}>
        {[85, 65, 75, 55, 70].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 6 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Error state ────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 48, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
        Generation failed
      </h3>
      <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 360, marginBottom: 24 }}>
        {message}
      </p>
      <button onClick={onRetry} className="btn btn-primary" style={{ padding: '10px 28px', borderRadius: 12 }}>
        ↺ Try again
      </button>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function CodeBuilderPage() {
  const [projectTitle, setProjectTitle] = useState('Cinema Booking UI')
  const [level, setLevel] = useState<Level>('intermediate')
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [loadingFeature, setLoadingFeature] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedCode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [focusList, setFocusList] = useState(false)

  // Per-feature cache
  const cache = useRef<Record<string, GeneratedCode>>({})
  // Prevent duplicate requests
  const inFlight = useRef(false)

  const generate = useCallback(async (featureId: string, force = false) => {
    if (inFlight.current) return
    const feat = FEATURES.find(f => f.id === featureId)
    if (!feat) return

    // Cache hit
    if (!force && cache.current[featureId]) {
      setSelectedFeature(featureId)
      setResult(cache.current[featureId])
      setError(null)
      return
    }

    inFlight.current = true
    setSelectedFeature(featureId)
    setLoadingFeature(featureId)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: feat.label,
          projectTitle: projectTitle || 'My Project',
          stack: STACKS,
          level,
          projectType: 'frontend UI project',
          existingFeatures: Object.keys(cache.current).map(id => FEATURES.find(f => f.id === id)?.label).filter(Boolean),
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      cache.current[featureId] = data
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoadingFeature(null)
      inFlight.current = false
    }
  }, [projectTitle, level])

  const handleFeatureClick = (featureId: string) => generate(featureId)
  const handleRegenerate = () => {
    if (selectedFeature) {
      delete cache.current[selectedFeature]
      generate(selectedFeature, true)
    }
  }

  const isCached = (id: string) => id in cache.current

  return (
    <>
      <div className="topbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}><EmojiIcon emoji="⚡" className="inline" /></span>
          <div>
            <span className="topbar-title" style={{ fontSize: 17 }}>Code Builder</span>
            <span style={{ fontSize: 11, color: 'var(--dim)', marginLeft: 10 }}>AI-powered component generator</span>
          </div>
        </div>
        <div className="topbar-right">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{ display: 'flex', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 20,
          background: 'rgba(10,14,28,0.3)', overflowY: 'auto'
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              Project
            </div>
            <input
              className="input"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="Project name…"
              style={{ marginBottom: 0, fontSize: 13 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              Stack
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STACKS.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sky)', boxShadow: '0 0 8px rgba(34,211,238,0.6)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              Skill level
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={{
                    padding: '7px 12px', borderRadius: 8, border: `1px solid ${level === l ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    background: level === l ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: level === l ? '#fff' : 'var(--gray)', fontSize: 12, fontWeight: level === l ? 700 : 400,
                    cursor: 'pointer', textAlign: 'left', textTransform: 'capitalize', transition: 'all .15s'
                  }}
                >
                  {l === 'beginner' ? '🌱' : l === 'intermediate' ? '🔥' : '⚡'} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Cache status */}
          {Object.keys(cache.current).length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
                Cached ({Object.keys(cache.current).length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.keys(cache.current).map(id => {
                  const f = FEATURES.find(f => f.id === id)
                  return f ? (
                    <button
                      key={id}
                      onClick={() => handleFeatureClick(id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: selectedFeature === id ? 'rgba(52,211,153,0.1)' : 'transparent', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11, textAlign: 'left' }}
                    >
                      ✓ {f.label}
                    </button>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── MIDDLE PANEL ── */}
        <div style={{
          width: 260, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto', background: 'rgba(10,14,28,0.2)'
        }}>
          <div style={{ padding: '16px 16px 8px', fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Features ({FEATURES.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px 16px' }}>
            {FEATURES.map(feature => {
              const isSelected = selectedFeature === feature.id
              const isLoading = loadingFeature === feature.id
              const isDone = isCached(feature.id)

              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  disabled={loadingFeature !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10, border: 'none',
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? 'var(--blue)' : 'transparent'}`,
                    cursor: loadingFeature !== null ? 'not-allowed' : 'pointer',
                    opacity: loadingFeature !== null && !isLoading ? 0.5 : 1,
                    textAlign: 'left', transition: 'all .15s', width: '100%',
                  }}
                  title={feature.desc}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {isLoading ? '⟳' : isDone ? '✅' : feature.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#fff' : 'var(--text)', marginBottom: 1 }}>
                      {feature.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {feature.desc}
                    </div>
                  </div>
                  {isLoading && (
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--sky)', borderTopColor: 'transparent', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
                  )}
                  {isDone && !isLoading && (
                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>CACHED</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL (Code Viewer) ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'rgba(6,9,20,0.5)' }}>
          {loadingFeature ? (
            <LoadingSkeleton feature={FEATURES.find(f => f.id === loadingFeature)?.label ?? ''} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => selectedFeature && generate(selectedFeature, true)} />
          ) : result ? (
            <CodeViewer result={result} onRegenerate={handleRegenerate} regenerating={loadingFeature !== null} />
          ) : (
            <EmptyState onPick={() => setFocusList(true)} />
          )}
        </div>

      </div>

      {/* Token color styles */}
      <style>{`
        .tok-keyword  { color: #C792EA; }
        .tok-builtin  { color: #82AAFF; }
        .tok-type     { color: #FFCB6B; }
        .tok-string   { color: #C3E88D; }
        .tok-comment  { color: #546E7A; font-style: italic; }
        .tok-number   { color: #F78C6C; }
        .tok-literal  { color: #FF9CAC; }
        .tok-tag      { color: #F07178; }
        .tok-htmltag  { color: #89DDFF; }
        .tok-attr     { color: #FFCB6B; }
        .tok-fn       { color: #82AAFF; }
      `}</style>
    </>
  )
}
