'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'

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
          <div className="card fu d1" style={{ padding: 32 }}>
            <div 
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontSize: 14, 
                color: 'var(--text)', 
                lineHeight: 1.8, 
                whiteSpace: 'pre-wrap' 
              }}
            >
              {streamedContent}
            </div>
          </div>
        ) : (
          <div className="card fu d1" style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:36, marginBottom:12 }}><EmojiIcon emoji="💡" className="inline" /></div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>No suggestions generated</div>
            <p style={{ fontSize:13, color:'var(--gray)', marginBottom: 24 }}>Click Regenerate to ask AI for portfolio project ideas.</p>
            <button onClick={runGenerate} disabled={generating} className="btn btn-primary">
              <EmojiIcon emoji="⚡" className="inline" /> Generate Now
            </button>
          </div>
        )}
      </div>
    </>
  )
}
