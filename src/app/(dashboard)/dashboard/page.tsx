'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

function useGreeting() {
  const [greeting, setGreeting] = useState('Good morning')
  const [emoji, setEmoji] = useState('🌅')
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours()
      if (h >= 5 && h < 12)  { setGreeting('Good morning');  setEmoji('🌅') }
      else if (h >= 12 && h < 17) { setGreeting('Good afternoon'); setEmoji('☀️') }
      else if (h >= 17 && h < 21) { setGreeting('Good evening');   setEmoji('🌆') }
      else                         { setGreeting('Working late');   setEmoji('🌙') }
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [])
  return { greeting, emoji }
}

export default function DashboardPage() {
  const { greeting, emoji } = useGreeting()

  const { user, signOut } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  const userName = user?.name || user?.githubUsername || 'Developer'
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState({ streak: 0, schedulers: 0, totalCommits: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  const [logs, setLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setStats(data)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))

    fetch('/api/dashboard/logs')
      .then(r => r.json())
      .then(data => {
        if (data && data.logs) setLogs(data.logs)
      })
      .catch(() => {})
      .finally(() => setLogsLoading(false))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Load avatar from localStorage (persisted by Settings page)
  useEffect(() => {
    try {
      const av = localStorage.getItem('rp_avatar')
      if (av) setAvatarUrl(av)
    } catch {}
  }, [])

  return (
    <>
      {/* Topbar */}
      <div className="topbar" style={{ background: 'transparent', borderBottom: 'none', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar: custom photo or gradient initials */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', boxShadow: '0 0 16px rgba(99,102,241,0.2)', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span>{(userName.split(' ').map(p => p[0]).join('').toUpperCase() || 'RP').slice(0,2)}</span>
            }
          </div>
          <span className="topbar-title" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>{greeting}, {userName.split(' ')[0]}</span>
        </div>
        
        {/* Center Nav */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(20, 24, 46, 0.4)', padding: '6px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', color: '#fff', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <span style={{ fontSize: 14 }}>⊞</span> Overview
          </Link>
          <Link href="/analytics" className="btn-ghost" style={{ padding: '6px 14px', border: 'none', borderRadius: 10, color: 'var(--dim)', fontSize: 14, textDecoration: 'none', display: 'flex' }}><EmojiIcon emoji="📊" className="inline" /></Link>
          <Link href="/projects" className="btn-ghost" style={{ padding: '6px 14px', border: 'none', borderRadius: 10, color: 'var(--dim)', fontSize: 14, textDecoration: 'none', display: 'flex' }}><EmojiIcon emoji="📁" className="inline" /></Link>
          <Link href="/deployments" className="btn-ghost" style={{ padding: '6px 14px', border: 'none', borderRadius: 10, color: 'var(--dim)', fontSize: 14, textDecoration: 'none', display: 'flex' }}><EmojiIcon emoji="🚀" className="inline" /></Link>
          <Link href="/settings" className="btn-ghost" style={{ padding: '6px 14px', border: 'none', borderRadius: 10, color: 'var(--dim)', fontSize: 14, textDecoration: 'none', display: 'flex' }}>⚙️</Link>
        </div>

        <div className="topbar-right" style={{ display:'flex', gap:12 }}>
          {/* User dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: dropdownOpen ? 'rgba(99,102,241,0.15)' : 'rgba(20, 24, 46, 0.4)',
                padding: '6px 14px 6px 6px', borderRadius: 100,
                border: `1px solid ${dropdownOpen ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(20px)', cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, overflow: 'hidden' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{(userName.split(' ').map(p => p[0]).join('').toUpperCase() || 'RP').slice(0,2)}</span>
                }
              </div>
              <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                {userName.split(' ')[0]} <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2, display: 'inline-block', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>▼</span>
              </span>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: 220, background: 'rgba(12,18,36,0.95)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden', zIndex: 100,
                animation: 'fadeScale .15s ease forwards',
              }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                    {avatarUrl ? <img src={avatarUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : (userName.split(' ').map(p=>p[0]).join('').toUpperCase()||'RP').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{userName}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>Free plan</div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px 0' }}>
                  {[
                    { label: '⚙️ Settings',        href: '/settings' },
                    { label: '📊 Analytics',        href: '/analytics' },
                    { label: '⭐ Portfolio Score',  href: '/portfolio' },
                    { label: '⚡ Code Builder',     href: '/code-builder' },
                    { label: '🚀 Upgrade to Pro',   href: '/upgrade' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block', padding: '9px 16px', fontSize: 13,
                        color: 'var(--text)', textDecoration: 'none',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
                  <button
                    onClick={() => { setDropdownOpen(false); signOut() }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <EmojiIcon emoji="🚪" className="inline" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
          <Link href="/suggestions" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
            + New Suggestions
          </Link>
        </div>
      </div>

            <div className="page-content">

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 20, marginBottom:32 }} className="fu d1">
          {[
            { icon:'🔥', label:'GitHub Streak',     value: statsLoading ? '…' : `${stats.streak} Days`,    color:'var(--amber)', bg:'linear-gradient(135deg, rgba(251,191,36,.15), rgba(251,191,36,.05))', border: 'rgba(251,191,36,.3)',  className: 'card card-hover card-glow-amber', href: '/analytics' },
            { icon:'📅', label:'Active Schedulers', value: statsLoading ? '…' : String(stats.schedulers),  color:'var(--sky)',   bg:'linear-gradient(135deg, rgba(34,211,238,.15), rgba(34,211,238,.05))',  border: 'rgba(34,211,238,.3)',  className: 'card card-hover',              href: '/scheduler' },
            { icon:'🚀', label:'Total Commits',     value: statsLoading ? '…' : String(stats.totalCommits), color:'var(--green)', bg:'linear-gradient(135deg, rgba(52,211,153,.15), rgba(52,211,153,.05))',  border: 'rgba(52,211,153,.3)',  className: 'card card-hover',              href: '/portfolio' },
          ].map((s, idx) => (
            <Link href={s.href} className={s.className} key={s.label} style={{ display:'flex', flexDirection: 'column', gap:16, padding: '24px', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:s.bg, border: `1px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow: `inset 0 2px 10px rgba(255,255,255,0.05)` }}><EmojiIcon emoji={s.icon} /></div>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, color:'#fff', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight: 500, color:'var(--gray)', letterSpacing: '0.2px' }}>{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="card fu d2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}><EmojiIcon emoji="📝" className="inline" /></span>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>Recent Commit Logs</h2>
            </div>
            <Link href="/analytics" className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Repository</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray)', textAlign: 'center' }}>Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray)', textAlign: 'center' }}>No recent commits. Create a scheduler to get started!</td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: i === logs.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#fff', fontWeight: 500 }}><EmojiIcon emoji="📁" className="inline" style={{ marginRight: 6 }} />{log.repo}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray)' }}>{log.msg}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: log.color, background: `rgba(${log.color === 'var(--green)' ? '52,211,153' : '248,113,113'}, 0.1)`, padding: '4px 8px', borderRadius: 100 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: log.color }} />
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--dim)' }}>
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </>
  )
}
