'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePreferences, type WallpaperOption, type AccentColor } from '@/context/PreferencesContext'

const WALLPAPERS: { id: WallpaperOption; label: string; preview: string }[] = [
  { id:'default', label:'Default',  preview:'linear-gradient(135deg,rgba(37,99,235,.2),rgba(124,58,237,.15))' },
  { id:'mesh',    label:'Mesh',     preview:'radial-gradient(at 30% 20%,rgba(37,99,235,.35),transparent 55%),radial-gradient(at 80%10%,rgba(124,58,237,.3),transparent 50%),radial-gradient(at 0%80%,rgba(16,185,129,.2),transparent 50%)' },
  { id:'aurora',  label:'Aurora',   preview:'linear-gradient(135deg,rgba(6,182,212,.3),rgba(37,99,235,.25),rgba(124,58,237,.25),rgba(16,185,129,.2))' },
  { id:'tokyo',   label:'Tokyo',    preview:'linear-gradient(180deg,rgba(247,89,171,.25),rgba(37,99,235,.2),rgba(6,182,212,.2))' },
  { id:'grid',    label:'Grid',     preview:'repeating-linear-gradient(rgba(96,165,250,.1) 0,rgba(96,165,250,.1) 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,rgba(96,165,250,.1) 0,rgba(96,165,250,.1) 1px,transparent 1px,transparent 24px)' },
  { id:'dots',    label:'Dots',     preview:'radial-gradient(circle,rgba(96,165,250,.35) 1px,transparent 1px)' },
  { id:'circuit', label:'Circuit',  preview:'repeating-linear-gradient(45deg,rgba(96,165,250,.12) 0,rgba(96,165,250,.12) 1px,transparent 1px,transparent 10px)' },
  { id:'noise',   label:'Noise',    preview:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.18\'/%3E%3C/svg%3E")' },
  { id:'none',    label:'None',     preview:'#0B1829' },
]

const ACCENTS: { id: AccentColor; color: string; label: string }[] = [
  { id:'blue',   color:'#2563EB', label:'Blue'   },
  { id:'purple', color:'#7C3AED', label:'Purple' },
  { id:'green',  color:'#059669', label:'Green'  },
  { id:'amber',  color:'#D97706', label:'Amber'  },
  { id:'pink',   color:'#DB2777', label:'Pink'   },
  { id:'cyan',   color:'#0891B2', label:'Cyan'   },
]

type Tab = 'wallpaper' | 'colour' | 'display'

export default function FloatingCustomizer() {
  const {
    wallpaper, setWallpaper,
    accent, setAccent,
    sidebarCompact, setSidebarCompact,
    reducedMotion, setReducedMotion,
  } = usePreferences()

  const [open,       setOpen]       = useState(false)
  const [tab,        setTab]        = useState<Tab>('wallpaper')
  const [hexInput,   setHexInput]   = useState('#2563EB')
  const [hexError,   setHexError]   = useState(false)
  const [blurLevel,  setBlurLevel]  = useState(0)
  const [darkMode,   setDarkMode]   = useState(true)
  const [uploadedBg, setUploadedBg] = useState<string | null>(null)
  const [dragging,   setDragging]   = useState(false)

  const panelRef   = useRef<HTMLDivElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  // Apply blur to app body
  useEffect(() => {
    const main = document.querySelector('.main-content') as HTMLElement | null
    if (main) main.style.filter = blurLevel > 0 ? `blur(${blurLevel * 0.3}px) brightness(${1 - blurLevel * 0.015})` : ''
  }, [blurLevel])

  // Apply dark/light mode
  useEffect(() => {
    const root = document.documentElement
    if (!darkMode) {
      root.style.setProperty('--deep',  '#F1F5F9')
      root.style.setProperty('--navy',  '#E2E8F0')
      root.style.setProperty('--card',  '#fff')
      root.style.setProperty('--card2', '#F8FAFC')
      root.style.setProperty('--text',  '#0F172A')
      root.style.setProperty('--gray',  '#475569')
      root.style.setProperty('--dim',   '#94A3B8')
      root.style.setProperty('--border','rgba(0,0,0,.08)')
      root.style.setProperty('--border2','rgba(0,0,0,.15)')
    } else {
      root.style.removeProperty('--deep')
      root.style.removeProperty('--navy')
      root.style.removeProperty('--card')
      root.style.removeProperty('--card2')
      root.style.removeProperty('--text')
      root.style.removeProperty('--gray')
      root.style.removeProperty('--dim')
      root.style.removeProperty('--border')
      root.style.removeProperty('--border2')
    }
  }, [darkMode])

  function applyHex() {
    const clean = hexInput.trim()
    const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)
    if (!valid) { setHexError(true); return }
    setHexError(false)
    document.documentElement.style.setProperty('--blue', clean)
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) readImageFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readImageFile(file)
  }

  function readImageFile(file: File) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setUploadedBg(url)
      document.body.style.backgroundImage = `url("${url}")`
      document.body.style.backgroundSize  = 'cover'
      document.body.style.backgroundPosition = 'center'
      setWallpaper('none') // disable preset while custom image is active
    }
    reader.readAsDataURL(file)
  }

  function clearCustomBg() {
    setUploadedBg(null)
    setWallpaper('default')
    document.body.style.backgroundImage = ''
    document.body.style.backgroundSize  = ''
  }

  const activeAccentColor = ACCENTS.find(a => a.id === accent)?.color ?? '#2563EB'

  return (
    <div ref={panelRef} style={{ position:'fixed', bottom:24, right:24, zIndex:400 }}>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 60, right: 0,
          width: 300,
          background: 'rgba(11,24,41,.97)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          animation: 'fadeUp .2s ease both',
        }}>
          {/* Panel header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 10px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff' }}>Customise</span>
            <div style={{ display:'flex', gap:6 }}>
              {([
                { id:'wallpaper', icon:'🖼️', tip:'Background' },
                { id:'colour',   icon:'🎨', tip:'Colour'     },
                { id:'display',  icon:'⚙️', tip:'Display'    },
              ] as { id:Tab; icon:string; tip:string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  title={t.tip}
                  style={{ width:30, height:30, borderRadius:7, background: tab===t.id ? 'rgba(37,99,235,.2)' : 'transparent', border:`1px solid ${tab===t.id?'rgba(37,99,235,.35)':'transparent'}`, fontSize:14, cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center' }}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Panel body */}
          <div style={{ padding:'14px 16px', maxHeight:400, overflowY:'auto' }}>

            {/* ── Wallpaper tab ─────────────────── */}
            {tab === 'wallpaper' && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Preset backgrounds</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:16 }}>
                  {WALLPAPERS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => { clearCustomBg(); setWallpaper(w.id) }}
                      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer' }}
                    >
                      <div style={{
                        width:'100%', height:48, borderRadius:9,
                        background: w.preview,
                        backgroundSize: w.id==='grid'?'24px 24px':w.id==='dots'?'10px 10px':w.id==='circuit'?'20px 20px':'auto',
                        border: `2px solid ${wallpaper===w.id&&!uploadedBg ? activeAccentColor : 'rgba(255,255,255,.07)'}`,
                        transition: 'border-color .15s',
                        position: 'relative', overflow:'hidden',
                      }}>
                        {wallpaper===w.id && !uploadedBg && (
                          <div style={{ position:'absolute', top:4, right:4, width:14, height:14, borderRadius:'50%', background:activeAccentColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:800 }}>✓</div>
                        )}
                      </div>
                      <span style={{ fontSize:10, color: wallpaper===w.id&&!uploadedBg ? '#fff' : '#64748B', fontWeight: wallpaper===w.id&&!uploadedBg ? 600 : 400 }}>{w.label}</span>
                    </button>
                  ))}
                </div>

                {/* Upload custom */}
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8 }}>Custom image</p>

                {uploadedBg ? (
                  <div style={{ position:'relative', borderRadius:10, overflow:'hidden', marginBottom:4 }}>
                    <img src={uploadedBg} alt="Custom bg" style={{ width:'100%', height:80, objectFit:'cover', display:'block' }} />
                    <button
                      onClick={clearCustomBg}
                      style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,.7)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                    >✕</button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragging ? activeAccentColor : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 10, padding:'16px 12px', textAlign:'center',
                      cursor:'pointer', transition:'all .2s',
                      background: dragging ? 'rgba(37,99,235,.06)' : 'transparent',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize:20, marginBottom:4 }}><EmojiIcon emoji="📁" className="inline" /></div>
                    <p style={{ fontSize:11, color:'#64748B', lineHeight:1.5 }}>
                      Drag & drop or <span style={{ color:activeAccentColor }}>click to upload</span><br/>
                      JPG, PNG, WEBP · max 5MB
                    </p>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileInput} />
                  </div>
                )}
              </div>
            )}

            {/* ── Colour tab ───────────────────── */}
            {tab === 'colour' && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Accent colour</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
                  {ACCENTS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAccent(a.id)}
                      title={a.label}
                      style={{
                        width:32, height:32, borderRadius:'50%', background:a.color, cursor:'pointer',
                        border:`2.5px solid ${accent===a.id ? '#fff' : 'transparent'}`,
                        boxShadow: accent===a.id ? `0 0 0 3px ${a.color}50` : 'none',
                        transition:'all .15s',
                      }}
                    />
                  ))}
                </div>

                {/* Custom hex input */}
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8 }}>Custom hex colour</p>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:hexError ? '#F87171' : hexInput, border:'1px solid rgba(255,255,255,.12)', flexShrink:0, transition:'background .2s' }} />
                  <input
                    value={hexInput}
                    onChange={e => { setHexInput(e.target.value); setHexError(false) }}
                    onKeyDown={e => e.key === 'Enter' && applyHex()}
                    placeholder="#2563EB"
                    style={{ flex:1, background:'rgba(255,255,255,.05)', border:`1px solid ${hexError?'rgba(248,113,113,.4)':'rgba(255,255,255,.09)'}`, borderRadius:8, padding:'8px 11px', fontSize:12, color:'#fff', fontFamily:'monospace', outline:'none' }}
                  />
                  <button
                    onClick={applyHex}
                    style={{ padding:'8px 12px', borderRadius:8, background:'rgba(37,99,235,.2)', border:'1px solid rgba(37,99,235,.35)', fontSize:11, fontWeight:700, color:activeAccentColor, cursor:'pointer', whiteSpace:'nowrap' }}
                  >
                    Apply
                  </button>
                </div>
                {hexError && <p style={{ fontSize:10, color:'#F87171', marginTop:5 }}>Invalid hex. Use #RGB or #RRGGBB format.</p>}

                {/* Dark / light mode */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:18, padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#fff', marginBottom:2 }}>{darkMode ? '🌙 Dark mode' : '☀️ Light mode'}</div>
                    <div style={{ fontSize:10, color:'#475569' }}>Switch the interface theme</div>
                  </div>
                  <button
                    onClick={() => setDarkMode(d => !d)}
                    style={{ width:44, height:24, borderRadius:100, background: darkMode?activeAccentColor:'rgba(255,255,255,.15)', border:'none', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}
                  >
                    <span style={{ position:'absolute', top:3, left: darkMode?22:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>
                      {darkMode ? '🌙' : '☀️'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Display tab ──────────────────── */}
            {tab === 'display' && (
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Interface</p>

                {/* Blur slider */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#94A3B8' }}>Background blur</span>
                    <span style={{ fontSize:11, color:activeAccentColor, fontWeight:700 }}>{blurLevel === 0 ? 'Off' : `Level ${blurLevel}`}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={blurLevel}
                    onChange={e => setBlurLevel(Number(e.target.value))}
                    style={{ width:'100%', accentColor:activeAccentColor, cursor:'pointer' }}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:10, color:'#475569' }}>None</span>
                    <span style={{ fontSize:10, color:'#475569' }}>Heavy</span>
                  </div>
                </div>

                {[
                  { label:'Compact sidebar', desc:'Icon-only navigation', key:'compact',  value:sidebarCompact, fn: setSidebarCompact },
                  { label:'Reduce motion',  desc:'Disable animations',   key:'motion',   value:reducedMotion,  fn: setReducedMotion  },
                ].map(o => (
                  <div key={o.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', marginBottom:7 }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#CBD5E1' }}>{o.label}</div>
                      <div style={{ fontSize:10, color:'#475569' }}>{o.desc}</div>
                    </div>
                    <button
                      onClick={() => o.fn(!o.value)}
                      style={{ width:40, height:22, borderRadius:100, background: o.value ? activeAccentColor : 'rgba(255,255,255,.08)', border:'none', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}
                    >
                      <span style={{ position:'absolute', top:3, left: o.value?20:3, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                    </button>
                  </div>
                ))}

                {/* Reset */}
                <button
                  onClick={() => {
                    setWallpaper('default'); setAccent('blue'); setBlurLevel(0); setDarkMode(true)
                    setSidebarCompact(false); setReducedMotion(false); clearCustomBg()
                    document.documentElement.style.removeProperty('--blue')
                  }}
                  style={{ width:'100%', padding:'9px', borderRadius:9, background:'rgba(248,113,113,.07)', border:'1px solid rgba(248,113,113,.15)', fontSize:11, fontWeight:600, color:'#F87171', cursor:'pointer', marginTop:4, transition:'all .15s' }}
                >
                  Reset all customisation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 46, height: 46, borderRadius: '50%',
          background: open ? activeAccentColor : 'rgba(11,24,41,.95)',
          border: `1.5px solid ${open ? activeAccentColor : 'rgba(255,255,255,.12)'}`,
          boxShadow: open
            ? `0 4px 20px ${activeAccentColor}55, 0 0 0 4px ${activeAccentColor}22`
            : '0 4px 20px rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, cursor: 'pointer',
          transition: 'all .2s cubic-bezier(.34,1.4,.64,1)',
          transform: open ? 'scale(1.1) rotate(30deg)' : 'scale(1)',
        }}
        title="Customise appearance"
        aria-label="Open appearance customizer"
      >
        {open ? '✕' : '🎨'}
      </button>
    </div>
  )
}
