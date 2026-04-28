'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label:'Dashboard',      href:'/dashboard',      icon:'🏠', section:'main' },
  { label:'Suggestions',    href:'/suggestions',    icon:'💡', section:'main', badge:'6' },
  { label:'Quick Prompts',  href:'/quick-prompts',  icon:'⚡', section:'main' },
  { label:'My Projects',    href:'/projects',       icon:'📋', section:'main' },
  { label:'Roadmap',        href:'/roadmap/p1',     icon:'🗺️', section:'main' },
  { label:'Repo Generator', href:'/generator',      icon:'📦', section:'publish' },
  { label:'Drafts',         href:'/drafts',         icon:'✍️', section:'publish' },
  { label:'Publish',        href:'/publish',        icon:'🚀', section:'publish' },
  { label:'Portfolio Score',href:'/portfolio',      icon:'📊', section:'account' },
  { label:'Upgrade',        href:'/upgrade',        icon:'⭐', section:'account' },
  { label:'Settings',       href:'/settings',       icon:'⚙️', section:'account' },
]

const SECTIONS = [
  { key:'main',    label:'Navigation' },
  { key:'publish', label:'Build & Ship' },
  { key:'account', label:'Account' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const renderSection = (section: string) => navItems
    .filter(i => i.section === section)
    .map(item => {
      const active = isActive(item.href)
      return (
        <Link
          key={item.href + item.label}
          href={item.href}
          style={{
            display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
            borderRadius:10,
            color: active ? '#fff' : 'var(--gray)',
            fontSize:14, fontWeight: active ? 600 : 400,
            background: active ? 'rgba(99,102,241,.13)' : 'transparent',
            transition:'all .15s',
            position:'relative',
            textDecoration:'none',
            marginBottom:2,
          }}
        >
          {active && (
            <span style={{
              position:'absolute', left:0, top:'15%', bottom:'15%',
              width:3, background:'linear-gradient(180deg,#6366F1,#22D3EE)',
              borderRadius:'0 3px 3px 0', boxShadow:'0 0 10px rgba(99,102,241,.6)',
            }} />
          )}
          <span style={{ fontSize:17, width:22, textAlign:'center', flexShrink:0 }}><EmojiIcon emoji={item.icon} /></span>
          {item.label}
          {item.badge && (
            <span style={{
              marginLeft:'auto',
              background:'linear-gradient(135deg,#6366F1,#22D3EE)',
              color:'#fff', fontSize:9.5, fontWeight:700,
              padding:'2px 8px', borderRadius:100,
            }}>{item.badge}</span>
          )}
        </Link>
      )
    })

  return (
    <>
      {/* Mobile topbar */}
      <div
        style={{
          display:'none', alignItems:'center', justifyContent:'space-between',
          padding:'0 20px', height:58,
          background:'rgba(8,15,30,.88)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(99,102,241,.1)',
          position:'sticky', top:0, zIndex:30,
        }}
        className="mobile-topbar"
      >
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:9, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-0.3px' }}>
          <span style={{
            width:26, height:26, borderRadius:7,
            background:'linear-gradient(135deg,#6366F1,#22D3EE)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, boxShadow:'0 0 14px rgba(99,102,241,.45)',
          }}>✦</span>
          RepoPilot
        </Link>
        <button
          onClick={() => setOpen(true)}
          style={{
            background:'rgba(99,102,241,.08)',
            border:'1px solid rgba(99,102,241,.15)',
            borderRadius:9, width:38, height:38,
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', gap:4.5, cursor:'pointer',
          }}
        >
          {[18,14,18].map((w,i) => (
            <span key={i} style={{ width:w, height:1.5, background:'var(--text)', borderRadius:2, display:'block' }} />
          ))}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed', inset:0,
            background:'rgba(6,12,24,.75)',
            backdropFilter:'blur(8px)',
            WebkitBackdropFilter:'blur(8px)',
            zIndex:40,
            animation:'fadeIn .2s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:290,
        background:'rgba(8,15,30,.92)',
        backdropFilter:'blur(28px) saturate(1.4)',
        WebkitBackdropFilter:'blur(28px) saturate(1.4)',
        borderRight:'1px solid rgba(99,102,241,.12)',
        zIndex:50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .28s cubic-bezier(.4,0,.2,1)',
        display:'flex', flexDirection:'column', overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 16px', borderBottom:'1px solid rgba(99,102,241,.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-0.3px' }}>
            <span style={{
              width:28, height:28, borderRadius:8,
              background:'linear-gradient(135deg,#6366F1,#22D3EE)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, boxShadow:'0 0 16px rgba(99,102,241,.45)',
            }}>✦</span>
            RepoPilot
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', right: 16, top: 16,
              background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.15)',
              borderRadius:8, width:34, height:34,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--gray)', fontSize:18,
            }}
          >×</button>
        </div>

        {/* Nav */}
        <div style={{ padding:'12px 10px', flex:1 }}>
          {SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <p style={{
                fontSize:9.5, fontWeight:700, letterSpacing:'1.4px',
                textTransform:'uppercase', color:'var(--muted)',
                padding:'10px 8px 6px',
              }}>{label}</p>
              {renderSection(key)}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div style={{ padding:'14px 10px', borderTop:'1px solid rgba(99,102,241,.1)' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:12,
            background:'rgba(99,102,241,.06)',
            border:'1px solid rgba(99,102,241,.12)',
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(135deg,#6366F1,#22D3EE)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'#fff', flexShrink:0,
              boxShadow:'0 0 12px rgba(99,102,241,.4)',
            }}>RP</div>
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:'#fff' }}>User</p>
              <p style={{ fontSize:10, color:'var(--gray)', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
