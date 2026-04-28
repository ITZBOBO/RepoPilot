'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('[Dashboard Error]', error) }, [error])
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center', maxWidth:400, padding:'0 20px' }}>
        <div style={{ fontSize:40, marginBottom:14 }}>⚠️</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>Something went wrong</h2>
        <p style={{ fontSize:13, color:'var(--gray)', lineHeight:1.6, marginBottom:8 }}>
          This page crashed unexpectedly. Your data is safe.
        </p>
        <code style={{ display:'block', fontSize:11, color:'var(--red)', background:'rgba(248,113,113,.06)', border:'1px solid rgba(248,113,113,.15)', borderRadius:7, padding:'7px 12px', marginBottom:20, wordBreak:'break-all', textAlign:'left' }}>
          {error.message}
        </code>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={reset} className="btn btn-primary btn-sm">↻ Try again</button>
          <Link href="/dashboard" className="btn btn-ghost btn-sm"><EmojiIcon emoji="🏠" className="inline" /> Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
