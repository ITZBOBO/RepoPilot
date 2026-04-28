'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ minHeight:'100vh', background:'#070E1A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:'center', padding:'40px 20px', maxWidth:480 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#fff', marginBottom:10 }}>Something went wrong</h1>
        <p style={{ fontSize:14, color:'#94A3B8', marginBottom:10, lineHeight:1.7 }}>
          An unexpected error occurred. This has been logged.
        </p>
        <code style={{ display:'block', fontSize:11, color:'#F87171', background:'rgba(248,113,113,.06)', border:'1px solid rgba(248,113,113,.15)', borderRadius:8, padding:'8px 14px', marginBottom:28, wordBreak:'break-all' }}>
          {error.message}
        </code>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={reset} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#2563EB', color:'#fff', fontSize:13, fontWeight:600, padding:'10px 22px', borderRadius:9, border:'none', cursor:'pointer' }}>
            ↻ Try again
          </button>
          <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', color:'#E2E8F0', fontSize:13, fontWeight:600, padding:'10px 22px', borderRadius:9, border:'1px solid rgba(255,255,255,.07)', textDecoration:'none' }}>
            <EmojiIcon emoji="🏠" className="inline" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
