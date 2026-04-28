'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { mockActiveProject } from '@/data/mock'

const STATUS_COLOR: Record<string, string> = { DONE:'var(--green)', ACTIVE:'var(--blue)', PENDING:'var(--dim)' }
const TYPE_COLOR:   Record<string, string>  = { CODE:'badge-blue', CONFIG:'badge-gray', DESIGN:'badge-purple', WRITE:'badge-amber', DEPLOY:'badge-green' }

export default function ProjectDetailPage() {
  const [tasks, setTasks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      mockActiveProject.phases.flatMap((p: any) => p.tasks as any[]).map((t: any) => [t.id, t.done])
    )
  )
  const [openPhase, setOpenPhase] = useState<string | null>('ph3')

  function toggleTask(id: string) {
    setTasks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allTasks = mockActiveProject.phases.flatMap((p: any) => p.tasks as any[])
  const doneCount = Object.values(tasks).filter(Boolean).length
  const progress = Math.round((doneCount / allTasks.length) * 100)

  const p = mockActiveProject

  return (
    <>
      <div className="topbar">
        <Link href="/dashboard" style={{ fontSize:13, color:'var(--gray)', display:'flex', alignItems:'center', gap:6 }}>← Back</Link>
        <span style={{ color:'var(--dim)' }}>/</span>
        <span className="topbar-title"><EmojiIcon emoji={p.emoji} /> {p.name}</span>
        <div className="topbar-right">
          <Link href="/roadmap/p1" className="btn btn-ghost btn-sm"><EmojiIcon emoji="🗺" className="inline" />️ Roadmap</Link>
          <Link href="/generator" className="btn btn-primary btn-sm">Generate README →</Link>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>
          {/* Left — phases + tasks */}
          <div>
            {/* Progress bar */}
            <div className="card fu d1" style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:13, color:'var(--gray)' }}>Overall progress</span>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--sky)' }}>{doneCount}/{allTasks.length} tasks · {progress}%</span>
              </div>
              <div className="progress-track" style={{ height:8 }}>
                <div className="progress-bar progress-blue" style={{ width:`${progress}%` }} />
              </div>
            </div>

            {/* Phases */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="fu d2">
              {p.phases.map(phase => (
                <div key={phase.id} style={{ background:'var(--card)', border:`1px solid ${openPhase===phase.id ? 'rgba(37,99,235,.3)' : 'var(--border)'}`, borderRadius:14, overflow:'hidden' }}>
                  <div
                    onClick={() => setOpenPhase(openPhase === phase.id ? null : phase.id)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', cursor:'pointer' }}
                  >
                    <div style={{ width:28, height:28, borderRadius:'50%', background: phase.status==='DONE' ? 'var(--green)' : phase.status==='ACTIVE' ? 'var(--blue)' : 'var(--card2)', border:`2px solid ${STATUS_COLOR[phase.status]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {phase.status === 'DONE' ? '✓' : phase.number}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{phase.title}</div>
                      <div style={{ fontSize:11, color:'var(--dim)' }}>{phase.dayLabel} · {phase.tasks.length} tasks</div>
                    </div>
                    <span className={`badge ${phase.status==='DONE' ? 'badge-green' : phase.status==='ACTIVE' ? 'badge-blue' : 'badge-gray'}`}>{phase.status}</span>
                    <span style={{ color:'var(--dim)', fontSize:12 }}>{openPhase === phase.id ? '▲' : '▼'}</span>
                  </div>

                  {openPhase === phase.id && (
                    <div style={{ borderTop:'1px solid var(--border)' }}>
                      {phase.tasks.map(task => (
                        <div key={task.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:'1px solid var(--border)', transition:'background .15s' }}>
                          <div
                            onClick={() => toggleTask(task.id)}
                            style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${tasks[task.id] ? 'var(--green)' : 'var(--border2)'}`, background: tasks[task.id] ? 'var(--green)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, fontSize:9, color:'#fff', transition:'all .2s' }}
                          >
                            {tasks[task.id] ? '✓' : ''}
                          </div>
                          <span style={{ flex:1, fontSize:13, color: tasks[task.id] ? 'var(--dim)' : 'var(--text)', textDecoration: tasks[task.id] ? 'line-through' : 'none' }}>{task.title}</span>
                          <span className={`badge ${TYPE_COLOR[task.type] || 'badge-gray'}`}>{task.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="fu d2">
            <div className="card">
              <div style={{ fontSize:32, marginBottom:12 }}><EmojiIcon emoji={p.emoji} /></div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{p.name}</div>
              <p style={{ fontSize:12, color:'var(--gray)', lineHeight:1.6, marginBottom:14 }}>{p.description}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                <span className="badge badge-amber">{p.difficulty}</span>
                <span className="badge badge-gray">{p.estimatedDays} days</span>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {p.stack.map(tech => (
                  <span key={tech} style={{ fontSize:10, padding:'3px 8px', borderRadius:100, background:'rgba(255,255,255,.05)', border:'1px solid var(--border)', color:'var(--gray)' }}>{tech}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Quick actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Link href="/roadmap/p1" className="btn btn-secondary btn-sm" style={{ justifyContent:'flex-start' }}><EmojiIcon emoji="🗺" className="inline" />️ View full roadmap</Link>
                <Link href="/generator" className="btn btn-secondary btn-sm" style={{ justifyContent:'flex-start' }}><EmojiIcon emoji="📦" className="inline" /> Generate README</Link>
                <Link href="/publish" className="btn btn-secondary btn-sm" style={{ justifyContent:'flex-start' }}><EmojiIcon emoji="🚀" className="inline" /> Publish to GitHub</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
