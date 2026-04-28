'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { mockActiveProject, mockRepoAsset } from '@/data/mock'

export default function GeneratorPage() {
  const [tab, setTab] = useState<'readme'|'commits'|'issues'>('readme')
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(-1)
  const [generated, setGenerated] = useState(true)

  const steps = ['Reading your project phases…','Building README structure…','Writing commit plan…','Creating GitHub issues…','Finalising assets…']

  function runGenerate() {
    setGenerating(true)
    setGenStep(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      if (i >= steps.length) {
        clearInterval(iv)
        setTimeout(() => { setGenerating(false); setGenStep(-1); setGenerated(true) }, 600)
      } else setGenStep(i)
    }, 700)
  }

  const r = mockRepoAsset

  return (
    <>
      {generating && (
        <div className="gen-overlay">
          <div className="gen-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>Generating assets…</div>
            <div style={{ fontSize:13, color:'var(--gray)', marginBottom:28 }}>Building README, commit plan, and GitHub issues</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {steps.map((s, idx) => (
                <div key={idx} className={`gen-step ${idx < genStep ? 'done' : idx === genStep ? 'running' : ''}`}>
                  <span className="gen-dot" />{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <Link href="/projects/p1" style={{ fontSize:13, color:'var(--gray)' }}>← Back</Link>
        <span style={{ color:'var(--dim)' }}>/</span>
        <span className="topbar-title"><EmojiIcon emoji="📦" className="inline" /> Repo Generator</span>
        <div className="topbar-right">
          <button onClick={runGenerate} className="btn btn-primary btn-sm"><EmojiIcon emoji="⚡" className="inline" /> Regenerate all</button>
          <Link href="/publish" className="btn btn-primary btn-sm">Publish to GitHub →</Link>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>

          {/* Left — content */}
          <div>
            {!generated ? (
              <div className="card fu d1" style={{ textAlign:'center', padding:'60px 20px' }}>
                <div style={{ fontSize:40, marginBottom:16 }}><EmojiIcon emoji="📦" className="inline" /></div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>Generate your repo assets</div>
                <p style={{ fontSize:13, color:'var(--gray)', marginBottom:24, maxWidth:360, margin:'0 auto 24px' }}>
                  RepoPilot will write your README, plan your commits, and create GitHub issues — all based on your project phases.
                </p>
                <button onClick={runGenerate} className="btn btn-primary btn-md"><EmojiIcon emoji="⚡" className="inline" /> Generate now</button>
              </div>
            ) : (
              <>
                <div className="tabs fu d1" style={{ marginBottom:20 }}>
                  {(['readme','commits','issues'] as const).map(t => (
                    <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                      {t==='readme'?'📄 README':t==='commits'?'📝 Commit Plan':'🐛 Issues'}
                    </button>
                  ))}
                </div>

                {tab === 'readme' && (
                  <div className="card fu d2">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff' }}>README.md</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(r.readmeContent)}>Copy</button>
                    </div>
                    <pre style={{ fontSize:12, color:'var(--text)', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'monospace', background:'var(--card2)', border:'1px solid var(--border)', borderRadius:10, padding:16, overflowX:'auto' }}>
                      {r.readmeContent}
                    </pre>
                  </div>
                )}

                {tab === 'commits' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }} className="fu d2">
                    {r.commitPlan.map((c, i) => (
                      <div key={i} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <span style={{ fontFamily:'monospace', fontSize:11, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,.05)', border:'1px solid var(--border)', color:'var(--sky)', flexShrink:0 }}>{c.type}</span>
                        <span style={{ flex:1, fontSize:13, color:'var(--text)' }}>{c.message}</span>
                        <span style={{ fontSize:11, color:'var(--dim)' }}>{c.phase}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'issues' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }} className="fu d2">
                    {r.githubIssues.map((issue, i) => (
                      <div key={i} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <span style={{ width:24, height:24, borderRadius:'50%', background:'rgba(52,211,153,.1)', border:'1px solid rgba(52,211,153,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--green)', flexShrink:0 }}>#{i+1}</span>
                        <span style={{ flex:1, fontSize:13, color:'var(--text)' }}>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card fu d2">
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>Repo settings</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Repo name</label>
                  <input className="input" defaultValue={r.repoName} style={{ fontSize:13 }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Description</label>
                  <textarea className="input" defaultValue={r.description} style={{ resize:'none', height:80, fontSize:13 }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Visibility</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {(['PUBLIC','PRIVATE'] as const).map(v => (
                      <button key={v} className={`btn btn-sm ${v==='PUBLIC' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex:1 }}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="card fu d3">
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Topics</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {r.topics.map(t => (
                  <span key={t} style={{ fontSize:11, padding:'4px 10px', borderRadius:100, background:'rgba(96,165,250,.08)', border:'1px solid rgba(96,165,250,.2)', color:'var(--sky)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
