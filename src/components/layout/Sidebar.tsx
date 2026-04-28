'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'

// SVG icons as inline components for a clean, premium look
const Icons: Record<string, JSX.Element> = {
  dashboard:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  suggestions:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7 7 7 0 0 1-4 6.3V17a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1.7A7 7 0 0 1 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>,
  prompts:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  projects:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  roadmap:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6l9-3 9 3"/><path d="M3 18l9 3 9-3"/></svg>,
  generator:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  drafts:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  scheduler:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  publish:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>,
  portfolio:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  upgrade:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  settings:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  signout:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  code:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,

  expand:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
}

const NAV = [
  { label:'Dashboard',       href:'/dashboard',     icon:'dashboard',   section:'main' },
  { label:'Suggestions',     href:'/suggestions',   icon:'suggestions', section:'main', badge:'6' },
  { label:'Quick Prompts',   href:'/quick-prompts', icon:'prompts',     section:'main' },
  { label:'My Projects',     href:'/projects',      icon:'projects',    section:'main' },
  { label:'Roadmap',         href:'/roadmap/p1',    icon:'roadmap',     section:'main' },
  { label:'Repo Generator',  href:'/generator',      icon:'generator',   section:'build' },
  { label:'Code Builder',    href:'/code-builder',   icon:'code',        section:'build' },
  { label:'Drafts',          href:'/drafts',         icon:'drafts',      section:'build' },
  { label:'Scheduler',       href:'/scheduler',     icon:'scheduler',   section:'build' },
  { label:'Publish',         href:'/publish',       icon:'publish',     section:'build' },
  { label:'Portfolio Score', href:'/portfolio',     icon:'portfolio',   section:'account' },
  { label:'Upgrade',         href:'/upgrade',       icon:'upgrade',     section:'account', pro:true },
  { label:'Settings',        href:'/settings',      icon:'settings',    section:'account' },
]

const SECTION_LABELS: Record<string,string> = { main:'Navigation', build:'Build & Ship', account:'Account' }

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const match = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  const renderSection = (section: string) =>
    NAV.filter(i => i.section === section).map(item => (
      <Link key={item.href} href={item.href} className={`nav-item ${match(item.href) ? 'active' : ''}`} title={item.label} style={{ justifyContent: 'center', padding: '10px', marginBottom: '4px' }}>
        <span className="nav-icon">{Icons[item.icon]}</span>
      </Link>
    ))

  return (
    <aside className="sidebar collapsed" style={{ alignItems: 'center', padding: '24px 0', width: 72 }}>
      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        <Link href="/dashboard" className="sidebar-logo" style={{ padding: 0, borderBottom: 'none', margin: 0, justifyContent: 'center' }}>
          <span className="logo-icon" style={{ boxShadow: '0 0 20px rgba(99,102,241,.6)', borderRadius: '10px' }}>✦</span>
        </Link>
      </div>

      {/* Nav sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', alignItems: 'center' }}>
        {(['main','build','account'] as const).map(section => (
          <div key={section} className="nav-section" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, width: '100%', alignItems: 'center' }}>
            {renderSection(section)}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <Link href="/settings" style={{ textDecoration:'none' }}>
           <div className="user-avatar" title={user?.name ?? 'User'} style={{ width: 36, height: 36, background: '#1E293B' }}>
             {user ? (user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'RP') : 'RP'}
           </div>
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title="Sign out"
          style={{
            background:'none', border:'none', color:'var(--dim)', cursor:'pointer',
            padding: '8px', display: 'flex', justifyContent: 'center', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
        >
          {signingOut ? <span style={{fontSize:12}}>...</span> : Icons.signout}
        </button>
      </div>
    </aside>
  )
}
