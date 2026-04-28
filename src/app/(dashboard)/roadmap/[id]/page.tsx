'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { mockActiveProject } from '@/data/mock'

export default function RoadmapPage() {
  const [view, setView] = useState<'timeline'|'table'>('timeline')
  const p = mockActiveProject

  const allTasks = p.phases.flatMap((ph: any) => ph.tasks as any[])
  const done = allTasks.filter(t => t.done).length
  const pct  = Math.round((done / allTasks.length) * 100)

  return (
    <>
      <div className="topbar">
        <Link href="/projects/p1" style={{ fontSize:13, color:'var(--gray)', display:'flex', alignItems:'center', gap:6 }}>← Back</Link>
        <span style={{ color:'var(--dim)' }}>/</span>
        <span className="topbar-title"><EmojiIcon emoji="🗺" className="inline" />️ Roadmap — {p.name}</span>
        <div className="topbar-right">
          <div className="tabs">
            <button className={`tab ${view==='timeline'?'active':''}`} onClick={() => setView('timeline')}>Timeline</button>
            <button className={`tab ${view==='table'?'active':''}`} onClick={() => setView('table')}>Table</button>
          </div>
          <Link href="/generator" className="btn btn-primary btn-sm">Generate README →</Link>
        </div>
      </div>

      <div className="page-content">

        {/* Header + progress */}
        <div className="card fu d1" style={{ marginBottom:28, display:'flex', alignItems:'center', gap:24 }}>
          <div style={{ fontSize:40 }}><EmojiIcon emoji={p.emoji} /></div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#fff', marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:13, color:'var(--gray)', marginBottom:12 }}>{p.phases.length} phases · {allTasks.length} tasks · {p.estimatedDays} days estimated</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="progress-track" style={{ height:8, flex:1 }}>
                <div className="progress-bar progress-blue" style={{ width:`${pct}%` }} />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--sky)', flexShrink:0 }}>{pct}% done</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <span className="badge badge-amber">{p.difficulty}</span>
          </div>
        </div>

        {view === 'timeline' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }} className="fu d2">
            {p.phases.map((phase, idx) => {
              const phDone = phase.tasks.filter(t => t.done).length
              const phPct  = Math.round((phDone / phase.tasks.length) * 100)
              return (
                <div key={phase.id} style={{ display:'flex', gap:20 }}>
                  {/* Timeline column */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:40, flexShrink:0 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background: phase.status==='DONE' ? 'var(--green)' : phase.status==='ACTIVE' ? 'var(--blue)' : 'var(--card2)', border:`2px solid ${phase.status==='DONE' ? 'var(--green)' : phase.status==='ACTIVE' ? 'var(--blue)' : 'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', zIndex:1 }}>
                      {phase.status==='DONE' ? '✓' : phase.number}
                    </div>
                    {idx < p.phases.length - 1 && (
                      <div style={{ width:2, flex:1, background: phase.status==='DONE' ? 'var(--green)' : 'var(--border)', minHeight:40, marginTop:4 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1, paddingBottom:24 }}>
                    <div className="card" style={{ marginBottom:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                        <div>
                          <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff' }}>{phase.title}</div>
                          <div style={{ fontSize:11, color:'var(--dim)' }}>{phase.dayLabel}</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:11, color:'var(--gray)' }}>{phDone}/{phase.tasks.length}</span>
                          <span className={`badge ${phase.status==='DONE'?'badge-green':phase.status==='ACTIVE'?'badge-blue':'badge-gray'}`}>{phase.status}</span>
                        </div>
                      </div>
                      <div className="progress-track" style={{ height:4, marginBottom:12 }}>
                        <div className={`progress-bar ${phase.status==='DONE'?'progress-green':phase.status==='ACTIVE'?'progress-blue':'progress-amber'}`} style={{ width:`${phPct}%` }} />
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {phase.tasks.map(t => (
                          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0' }}>
                            <span style={{ fontSize:12 }}>{t.done ? '✅' : '⬜'}</span>
                            <span style={{ fontSize:12, color: t.done ? 'var(--dim)' : 'var(--text)', flex:1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                            <span className={`badge badge-gray`} style={{ fontSize:9 }}>{t.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table view */
          <div className="card fu d2" style={{ overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Phase','Task','Type','Status','Day'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.phases.flatMap((ph: any) => (ph.tasks as any[]).map((t: any) => (
                  <tr key={t.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px 14px', fontSize:12, color:'var(--gray)' }}>{ph.title}</td>
                    <td style={{ padding:'10px 14px', fontSize:13, color: t.done ? 'var(--dim)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</td>
                    <td style={{ padding:'10px 14px' }}><span className="badge badge-gray" style={{ fontSize:9 }}>{t.type}</span></td>
                    <td style={{ padding:'10px 14px' }}><span style={{ fontSize:12 }}>{t.done ? '✅ Done' : '⬜ Pending'}</span></td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:'var(--dim)' }}>{ph.dayLabel}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
