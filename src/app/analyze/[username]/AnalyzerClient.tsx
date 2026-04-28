'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props { username: string }

export default function AnalyzerClient({ username }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!username) return
    fetch(`/api/github/analyze?username=${username}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [username])

  return (
    <div style={{ minHeight: '100vh', background: '#050A15', color: '#fff', fontFamily: 'Inter, sans-serif', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>✦</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>RepoPilot</span>
        </Link>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, margin: 0 }}>GitHub Profile Analyzer</h1>
        <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', marginTop: 8 }}>Brutally honest. Actually helpful.</p>
      </div>

      {loading && (
        <div style={{ width: '100%', maxWidth: 600, padding: 60, background: 'rgba(15,23,42,0.6)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#A5B4FC' }}>Analyzing @{username}...</div>
          <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginTop: 8 }}>Brewing coffee for the senior dev roast...</div>
        </div>
      )}

      {!loading && error && (
        <div style={{ width: '100%', maxWidth: 600, padding: 40, background: 'rgba(248,113,113,0.08)', borderRadius: 24, border: '1px solid rgba(248,113,113,0.25)', textAlign: 'center', color: '#F87171' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Could not analyze this profile</div>
          <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>{error}</div>
          <Link href="/" style={{ marginTop: 24, display: 'inline-flex', padding: '12px 28px', background: 'linear-gradient(135deg,#6366F1,#3B82F6)', borderRadius: 12, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
            Back to RepoPilot
          </Link>
        </div>
      )}

      {!loading && data && (
        <div style={{ width: '100%', maxWidth: 620, animation: 'fadeScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>

          {/* Score receipt card */}
          <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(24px)', borderRadius: 24, border: '1px solid rgba(99,102,241,0.2)', padding: 36, boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#67E8F9', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>Profile Analysis</div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>@{username}</div>
              </div>
              {/* Score circle */}
              <div style={{ textAlign: 'center', background: data.score >= 80 ? 'rgba(52,211,153,0.1)' : data.score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)', border: `2px solid ${data.score >= 80 ? '#34D399' : data.score >= 60 ? '#FBBF24' : '#F87171'}`, borderRadius: 16, padding: '14px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: data.score >= 80 ? '#34D399' : data.score >= 60 ? '#FBBF24' : '#F87171', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Score</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: data.score >= 80 ? '#34D399' : data.score >= 60 ? '#FBBF24' : '#F87171', lineHeight: 1 }}>{data.score}</div>
                <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 2 }}>/100</div>
              </div>
            </div>

            {/* The Roast */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 16, padding: 22, marginBottom: 24, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>☕ Senior Dev Says...</div>
              <div style={{ fontSize: 15, fontStyle: 'italic', color: '#E2E8F0', lineHeight: 1.7 }}>"{data.roast}"</div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Last Active</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  {data.stats?.last_active_days === 0 ? '🔥 Today' : data.stats?.last_active_days === 1 ? 'Yesterday' : `${data.stats?.last_active_days}d ago`}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>READMEs Missing</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: (data.stats?.readmeless_repos || 0) > 0 ? '#F87171' : '#34D399' }}>
                  {data.stats?.readmeless_repos || 0}
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', fontWeight: 400 }}> / {data.stats?.readmeless_checked}</span>
                </div>
              </div>
            </div>

            {/* Fix This First */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>🚨 Fix This First</div>
              <div style={{ fontSize: 14, color: '#fff', background: 'rgba(248,113,113,0.08)', padding: 16, borderRadius: 12, border: '1px solid rgba(248,113,113,0.18)', lineHeight: 1.6 }}>
                {data.fix_this_first}
              </div>
            </div>

            {/* Top Skills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Skills:</span>
              {data.top_languages?.map((l: string) => (
                <span key={l} style={{ background: 'rgba(52,211,153,0.08)', color: '#34D399', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 100, border: '1px solid rgba(52,211,153,0.2)' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Share row */}
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigator.clipboard.writeText(`https://repopilot.com/analyze/${username}`)}
              style={{ flex: 1, padding: '14px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, color: '#A5B4FC', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              📋 Copy Share Link
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=I+just+got+my+GitHub+portfolio+analyzed+by+RepoPilot+and+scored+${data.score}/100+👀%0Arepopilot.com/analyze/${username}`}
              target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: '14px', background: 'rgba(29,161,242,0.1)', border: '1px solid rgba(29,161,242,0.25)', borderRadius: 14, color: '#60A5FA', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              𝕏 Share on Twitter
            </a>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 32, textAlign: 'center', padding: '32px', background: 'rgba(99,102,241,0.06)', borderRadius: 20, border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Want to actually fix your score?</div>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.7)', marginBottom: 20 }}>RepoPilot generates real portfolio projects, writes READMEs, and commits code on autopilot.</p>
            <Link href="/" style={{ display: 'inline-flex', padding: '14px 32px', background: 'linear-gradient(135deg,#6366F1,#22D3EE)', borderRadius: 14, color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: 15, letterSpacing: '-0.3px' }}>
              Build a Better Portfolio with RepoPilot ✦
            </Link>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeScale { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </div>
  )
}
