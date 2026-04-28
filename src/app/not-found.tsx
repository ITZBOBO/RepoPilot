import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#070E1A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:96, fontWeight:800, color:'rgba(37,99,235,.2)', lineHeight:1, marginBottom:8 }}>404</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color:'#fff', marginBottom:10 }}>Page not found</h1>
        <p style={{ fontSize:14, color:'#94A3B8', marginBottom:32, maxWidth:340, margin:'0 auto 32px', lineHeight:1.7 }}>
          This page doesn't exist or was moved. Let's get you back on track.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#2563EB', color:'#fff', fontSize:13, fontWeight:600, padding:'10px 22px', borderRadius:9, textDecoration:'none', boxShadow:'0 4px 14px rgba(37,99,235,.35)' }}>
            <EmojiIcon emoji="🏠" className="inline" /> Go to Dashboard
          </Link>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', color:'#E2E8F0', fontSize:13, fontWeight:600, padding:'10px 22px', borderRadius:9, border:'1px solid rgba(255,255,255,.07)', textDecoration:'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
