'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { usePreferences } from '@/context/PreferencesContext'

const SETTINGS_KEY = 'rp_settings'

const DEFAULT_FORM = {
  firstName: '', lastName: '', email: '', github: '',
  skillLevel: 'INTERMEDIATE', goal: 'internship',
  notifications: { suggestions: true, weekly: true, publish: true },
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { wallpaper, accent, setWallpaper, setAccent, sidebarCompact, setSidebarCompact } = usePreferences()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setAvatarUrl(dataUrl)
      try { localStorage.setItem('rp_avatar', dataUrl) } catch {}
    }
    reader.readAsDataURL(file)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }
  const [tab, setTab] = useState<'profile'|'github'|'appearance'|'plan'|'notifications'>('profile')
  const [form, setForm] = useState(DEFAULT_FORM)

  // Load persisted settings and avatar from localStorage on mount
  const [streakShield, setStreakShield] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        setForm(prev => ({ ...prev, ...JSON.parse(stored) }))
      } else if (user) {
        const [firstName = '', ...rest] = (user.name || '').split(' ')
        setForm(prev => ({
          ...prev,
          firstName,
          lastName: rest.join(' '),
          email: user.email || '',
          github: user.githubUsername || '',
        }))
      }
      const savedAvatar = localStorage.getItem('rp_avatar')
      if (savedAvatar) setAvatarUrl(savedAvatar)
    } catch {}

    // Fetch DB settings (Streak Shield, etc)
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings?.streak_shield_enabled !== undefined) {
          setStreakShield(d.settings.streak_shield_enabled)
        }
      })
      .catch(() => {})
  }, [user])

  // Persist settings: localStorage for display prefs, Supabase for career prefs
  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(form))

      // Persist skill_level + goal to Supabase users table
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillLevel: form.skillLevel, goal: form.goal }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Save failed (${res.status})`)
      }

      // Persist Streak Shield directly
      const patchRes = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak_shield_enabled: streakShield }),
      })
      if (!patchRes.ok) throw new Error('Failed to update streak shield settings')

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const s = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">⚙️ Settings</span>
        <div className="topbar-right">
          {saveError && (
            <span style={{ fontSize:12, color:'var(--red)', marginRight:12 }}>{saveError}</span>
          )}
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm" style={{ minWidth:100 }}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24 }}>

          {/* Settings nav */}
          <div>
            <div className="card" style={{ padding:8 }}>
              {(['profile','github','appearance','plan','notifications'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, background: tab===t ? 'rgba(37,99,235,.12)' : 'transparent', border:'none', color: tab===t ? '#fff' : 'var(--gray)', fontSize:13, fontWeight: tab===t ? 600 : 400, cursor:'pointer', textAlign:'left', marginBottom:2, transition:'all .15s' }}
                >
                  <span style={{ fontSize:15 }}>{t==='profile'?'👤':t==='github'?'🐙':t==='appearance'?'🎨':t==='plan'?'⭐':'🔔'}</span>
                  {t==='appearance'?'Appearance':t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <div style={{ margin:'8px 0', height:1, background:'var(--border)' }} />
              <button onClick={handleSignOut} disabled={signingOut} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, background:'transparent', border:'none', color:'var(--red)', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left', opacity: signingOut ? .6 : 1 }}>
                <span style={{ fontSize:15 }}><EmojiIcon emoji="🚪" className="inline" /></span>{signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>

          {/* Settings content */}
          <div>

            {tab === 'profile' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="fu d1">
                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>Profile information</div>

                  {/* Avatar */}
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, padding:'16px', background:'var(--card2)', borderRadius:12, border:'1px solid var(--border)' }}>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoChange}
                    />
                    {/* Avatar circle: shows uploaded photo or initials */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', flexShrink:0, cursor:'pointer', overflow:'hidden', position:'relative', boxShadow:'0 0 0 2px rgba(99,102,241,0.3)', transition:'box-shadow .2s' }}
                      title="Click to change photo"
                    >
                      {avatarUrl
                        ? <img src={avatarUrl} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <span>{((form.firstName[0] || '') + (form.lastName[0] || '')).toUpperCase() || 'BA'}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:4 }}>Profile photo</div>
                      <p style={{ fontSize:12, color:'var(--dim)', marginBottom:8 }}>
                        {avatarUrl ? 'Custom photo uploaded' : 'Click avatar or button to upload a photo'}
                      </p>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Change photo</button>
                        {avatarUrl && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color:'var(--red)', borderColor:'rgba(248,113,113,.2)' }}
                            onClick={() => { setAvatarUrl(null); try { localStorage.removeItem('rp_avatar') } catch {} }}
                          >Remove</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>First name</label>
                      <input className="input" value={form.firstName} onChange={e => s('firstName', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Last name</label>
                      <input className="input" value={form.lastName} onChange={e => s('lastName', e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Email address</label>
                    <input className="input" type="email" value={form.email} onChange={e => s('email', e.target.value)} />
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>Career preferences</div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Skill level</label>
                    <select className="input" value={form.skillLevel} onChange={e => s('skillLevel', e.target.value)} style={{ appearance:'none' }}>
                      <option value="BEGINNER">Beginner (less than 1 year)</option>
                      <option value="INTERMEDIATE">Intermediate (1–3 years)</option>
                      <option value="ADVANCED">Advanced (3+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Primary goal</label>
                    <select className="input" value={form.goal} onChange={e => s('goal', e.target.value)} style={{ appearance:'none' }}>
                      <option value="internship">Get a developer internship</option>
                      <option value="job">Land a full-time developer job</option>
                      <option value="freelance">Get freelance clients</option>
                      <option value="learning">Learn and improve skills</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {tab === 'github' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="fu d1">
                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>GitHub connection</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:12, background: 'rgba(52,211,153,.05)', border:'1px solid rgba(52,211,153,.2)', marginBottom:20 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background: 'var(--green)', display:'inline-block', animation:'blink 2s infinite' }} />
                    <span style={{ fontSize:13, fontWeight:600, color: 'var(--green)' }}>Connected</span>
                    {user?.githubUsername && <span style={{ fontSize:13, color:'var(--gray)', marginLeft:'auto' }}>@{user.githubUsername}</span>}
                    <button className="btn btn-ghost btn-sm" disabled style={{ marginLeft: user?.githubUsername ? 0 : 'auto', opacity: 0.5 }}>Connected</button>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>GitHub username</label>
                    <input className="input" value={form.github} onChange={e => s('github', e.target.value)} />
                  </div>
                </div>

                <div className="card">
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <EmojiIcon emoji="🛡️" className="inline" style={{ fontSize: 20 }} />
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff' }}>Streak Shield (Retention)</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom: 16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Enable Streak Shield</div>
                      <div style={{ fontSize:12, color:'var(--gray)' }}>
                        If you haven't committed by 8:00 PM, RepoPilot will automatically push a small, authentic commit to a dedicated <code style={{ background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4 }}>repopilot-streak-shield</code> repo to save your streak.
                      </div>
                    </div>
                    <button
                      onClick={() => setStreakShield(!streakShield)}
                      style={{ width:44, height:24, borderRadius:100, background: streakShield ? 'var(--blue)' : 'var(--card2)', border:`1px solid ${streakShield ? 'var(--blue)' : 'var(--border2)'}`, position:'relative', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                    >
                      <span style={{ position:'absolute', top:3, left: streakShield ? 22 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>Profile Badge (Growth)</div>
                  <p style={{ fontSize:12, color:'var(--gray)', marginBottom:16, lineHeight:1.6 }}>
                    Embed your live RepoPilot portfolio score and active streak directly into your GitHub <code style={{ background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4 }}>README.md</code>.
                  </p>
                  
                  {form.github ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {/* Live Preview */}
                      <div style={{ padding: 16, background: 'var(--card2)', borderRadius: 12, border: '1px solid var(--border)', display:'flex', justifyContent:'center' }}>
                        <img src={`/api/badge/${form.github}`} alt="RepoPilot Badge" style={{ width: 340, height: 120 }} />
                      </div>
                      
                      {/* Markdown Snippet */}
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Markdown Snippet</label>
                        <div style={{ display:'flex', gap:8 }}>
                          <input 
                            readOnly 
                            className="input" 
                            style={{ fontFamily:'monospace', fontSize:12, color:'var(--sky)' }}
                            value={`[![RepoPilot Stats](https://repopilot.com/api/badge/${form.github})](https://repopilot.com)`} 
                          />
                          <button 
                            className="btn btn-primary" 
                            onClick={() => navigator.clipboard.writeText(`[![RepoPilot Stats](https://repopilot.com/api/badge/${form.github})](https://repopilot.com)`)}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize:12, color:'var(--red)' }}>Please enter your GitHub username above to generate your badge.</div>
                  )}
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>Permissions</div>
                  {[
                    { label:'Read profile', desc:'Required to scan your existing repos and portfolio', granted:true },
                    { label:'Create repos', desc:'Needed to publish your projects to GitHub', granted:true },
                    { label:'Write commits', desc:'Required for the commit scheduler feature', granted:false },
                  ].map(p => (
                    <div key={p.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontSize:14 }}>{p.granted ? '✅' : '⬜'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{p.label}</div>
                        <div style={{ fontSize:11, color:'var(--dim)' }}>{p.desc}</div>
                      </div>
                      {!p.granted && <button className="btn btn-primary btn-sm">Grant</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="fu d1">
                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>Background wallpaper</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {([
                      { id:'default', label:'Cosmic',   preview:'radial-gradient(ellipse at 80% -20%, rgba(67,56,202,.8) 0%, transparent 100%), radial-gradient(ellipse at 10% 50%, rgba(167,139,250,.6) 0%, transparent 100%)' },
                      { id:'mesh',    label:'Mesh',      preview:'radial-gradient(at 40% 20%,rgba(37,99,235,.3),transparent 50%),radial-gradient(at 80% 0%,rgba(124,58,237,.2),transparent 50%)' },
                      { id:'aurora',  label:'Aurora',    preview:'linear-gradient(135deg,rgba(6,182,212,.25),rgba(37,99,235,.2),rgba(124,58,237,.2),rgba(16,185,129,.2))' },
                      { id:'tokyo',   label:'Tokyo',     preview:'linear-gradient(180deg,rgba(247,89,171,.2),rgba(37,99,235,.2),rgba(6,182,212,.2))' },
                      { id:'grid',    label:'Grid',      preview:'repeating-linear-gradient(rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 40px)' },
                      { id:'dots',    label:'Dots',      preview:'radial-gradient(circle,rgba(96,165,250,.3) 1px,transparent 1px)' },
                      { id:'circuit', label:'Circuit',   preview:'repeating-linear-gradient(45deg,rgba(96,165,250,.07) 0,rgba(96,165,250,.07) 1px,transparent 1px,transparent 12px)' },
                      { id:'noise',   label:'Noise',     preview:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")` },
                      { id:'none',    label:'None',      preview:'#070E1A' },
                    ] as const).map(w => (
                      <button
                        key={w.id}
                        onClick={() => setWallpaper(w.id)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}
                      >
                        <div style={{ width:'100%', height:60, borderRadius:10, background:w.preview, backgroundSize: w.id==='grid'?'40px 40px':w.id==='dots'?'14px 14px':'auto', border:`2px solid ${wallpaper===w.id?'var(--blue)':'var(--border)'}`, transition:'border-color .15s', position:'relative', overflow:'hidden' }}>
                          {wallpaper === w.id && (
                            <div style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700 }}>✓</div>
                          )}
                        </div>
                        <span style={{ fontSize:11, color: wallpaper===w.id ? '#fff' : 'var(--gray)', fontWeight: wallpaper===w.id ? 600 : 400 }}>{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>Accent colour</div>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    {([
                      { id:'blue',   color:'#2563EB', label:'Blue'   },
                      { id:'purple', color:'#7C3AED', label:'Purple' },
                      { id:'green',  color:'#059669', label:'Green'  },
                      { id:'amber',  color:'#D97706', label:'Amber'  },
                      { id:'pink',   color:'#DB2777', label:'Pink'   },
                      { id:'cyan',   color:'#0891B2', label:'Cyan'   },
                    ] as const).map(a => (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer' }}
                      >
                        <div style={{ width:36, height:36, borderRadius:'50%', background:a.color, border:`2.5px solid ${accent===a.id?'#fff':'transparent'}`, boxShadow: accent===a.id?`0 0 0 3px ${a.color}55`:'none', transition:'all .15s' }} />
                        <span style={{ fontSize:11, color: accent===a.id?'#fff':'var(--dim)' }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>Interface options</div>
                  {[
                    { label:'Compact sidebar', desc:'Smaller nav items with icons only (hover to see labels)', key:'sidebarCompact', value:sidebarCompact, fn: setSidebarCompact },
                  ].map(o => (
                    <div key={o.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{o.label}</div>
                        <div style={{ fontSize:11, color:'var(--dim)' }}>{o.desc}</div>
                      </div>
                      <button
                        onClick={() => o.fn(!o.value)}
                        style={{ width:44, height:24, borderRadius:100, background: o.value?'var(--blue)':'var(--card2)', border:`1px solid ${o.value?'var(--blue)':'var(--border2)'}`, position:'relative', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                      >
                        <span style={{ position:'absolute', top:3, left: o.value?22:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'plan' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="fu d1">
                <div className="card" style={{ background:'rgba(37,99,235,.05)', border:'1px solid rgba(37,99,235,.2)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>Current plan</div>
                    <span className="badge badge-gray">Free</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                    {[
                      { label:'Suggestions used', value:'2 / 3', pct:67 },
                      { label:'Active projects', value:'1 / 1', pct:100 },
                    ].map(s => (
                      <div key={s.label} style={{ padding:'12px', background:'var(--card2)', borderRadius:10, border:'1px solid var(--border)' }}>
                        <div style={{ fontSize:11, color:'var(--dim)', marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>{s.value}</div>
                        <div className="progress-track" style={{ height:4 }}>
                          <div className="progress-bar" style={{ width:`${s.pct}%`, background: s.pct >= 90 ? 'var(--red)' : 'var(--blue)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'14px', background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', borderRadius:10, marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--amber)', marginBottom:4 }}><EmojiIcon emoji="🎉" className="inline" /> Early access deal</div>
                    <p style={{ fontSize:12, color:'var(--gray)' }}>Upgrade to Pro for <strong style={{ color:'var(--amber)' }}>$49 lifetime</strong> (normally $9/month). Limited spots remaining.</p>
                  </div>
                  <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}>⭐ Upgrade to Pro — $49 lifetime</button>
                </div>

                <div className="card">
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>Pro features unlocked</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {['Unlimited suggestions','Unlimited projects','GitHub publishing','Commit planner','Portfolio score','Priority support','Early feature access','Remove branding'].map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text)', padding:'8px 10px', borderRadius:8, background:'var(--card2)' }}>
                        <span style={{ color:'var(--green)', fontSize:11 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="card fu d1">
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:20 }}>Notification preferences</div>
                {[
                  { key:'suggestions', icon:'💡', label:'New suggestions ready',       desc:'Get notified when your AI suggestions are generated or refreshed' },
                  { key:'weekly',      icon:'📅', label:'Weekly portfolio report',     desc:'A weekly summary of your GitHub activity and portfolio score changes' },
                  { key:'publish',     icon:'🚀', label:'Publish confirmations',       desc:'Confirm before we push anything to your GitHub account' },
                ].map(n => (
                  <div key={n.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:22, flexShrink:0 }}><EmojiIcon emoji={n.icon} /></span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{n.label}</div>
                      <div style={{ fontSize:12, color:'var(--dim)' }}>{n.desc}</div>
                    </div>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, notifications: { ...prev.notifications, [n.key]: !prev.notifications[n.key as keyof typeof prev.notifications] } }))}
                      style={{ width:44, height:24, borderRadius:100, background: form.notifications[n.key as keyof typeof form.notifications] ? 'var(--blue)' : 'var(--card2)', border:`1px solid ${form.notifications[n.key as keyof typeof form.notifications] ? 'var(--blue)' : 'var(--border2)'}`, position:'relative', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                    >
                      <span style={{ position:'absolute', top:3, left: form.notifications[n.key as keyof typeof form.notifications] ? 22 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
