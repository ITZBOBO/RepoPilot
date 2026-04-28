'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Repo   { name: string; full_name: string; private: boolean; language: string | null }
interface Scheduler {
  id:              string
  repo_name:       string
  repo_full_name:  string
  cron_expression: string
  description:     string
  language:        string
  file_path:       string
  status:          'active' | 'paused' | 'deleted'
  last_run_at:     string | null
  total_commits:   number
  created_at:      string
}
interface CommitLog {
  id:             string
  commit_sha:     string | null
  commit_message: string
  file_path:      string
  ran_at:         string
  success:        boolean
  error_message:  string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SCHEDULE_PRESETS = [
  { label: 'Every day at 9am',      value: '0 9 * * *'    },
  { label: 'Every day at 6pm',      value: '0 18 * * *'   },
  { label: 'Weekdays only at 10am', value: '0 10 * * 1-5' },
  { label: 'Every day at noon',     value: '0 12 * * *'   },
  { label: 'Custom cron…',          value: 'custom'        },
]
const LANGUAGES = ['JavaScript','TypeScript','Python','Go','Rust','Java','C#','Ruby','PHP','Swift']

function humanCron(expr: string): string {
  const map: Record<string, string> = {
    '0 9 * * *':    'Daily at 9:00 AM',
    '0 18 * * *':   'Daily at 6:00 PM',
    '0 10 * * 1-5': 'Weekdays at 10:00 AM',
    '0 12 * * *':   'Daily at noon',
  }
  return map[expr] ?? expr
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SchedulerPage() {
  const [repos,       setRepos]       = useState<Repo[]>([])
  const [schedulers,  setSchedulers]  = useState<Scheduler[]>([])
  const [logs,        setLogs]        = useState<Record<string, CommitLog[]>>({})
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [reposLoading, setReposLoading] = useState(true)
  const [listLoading,  setListLoading]  = useState(true)
  const [runningId,    setRunningId]    = useState<string | null>(null)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)

  // Form state
  const [form, setForm] = useState({
    repoFullName:   '',
    filePath:       'src/utils/helpers.ts',
    language:       'TypeScript',
    description:    '',
    schedulePreset: SCHEDULE_PRESETS[0].value,
    customCron:     '',
  })
  const [creating, setCreating] = useState(false)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // Fetch repos
  useEffect(() => {
    fetch('/api/github/repos')
      .then(r => r.json())
      .then(d => { if (d.repos) setRepos(d.repos) })
      .finally(() => setReposLoading(false))
  }, [])

  // Fetch schedulers
  function loadSchedulers() {
    setListLoading(true)
    fetch('/api/scheduler')
      .then(r => r.json())
      .then(d => { if (d.schedulers) setSchedulers(d.schedulers) })
      .finally(() => setListLoading(false))
  }
  useEffect(() => { loadSchedulers() }, [])

  // Create scheduler
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.repoFullName || !form.description) return
    setCreating(true)
    const cronExpression = form.schedulePreset === 'custom' ? form.customCron : form.schedulePreset
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cronExpression }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast('Scheduler created!')
      setForm(f => ({ ...f, description: '', repoFullName: '' }))
      loadSchedulers()
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setCreating(false)
    }
  }

  // Update status
  async function updateStatus(id: string, status: 'active' | 'paused' | 'deleted') {
    const res = await fetch('/api/scheduler', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setSchedulers(prev => prev
        .map(s => s.id === id ? { ...s, status } : s)
        .filter(s => s.status !== 'deleted'))
      showToast(status === 'deleted' ? 'Scheduler deleted.' : status === 'paused' ? 'Paused.' : 'Resumed.')
    }
  }

  // Run now
  async function runNow(schedulerId: string) {
    setRunningId(schedulerId)
    try {
      const res = await fetch('/api/scheduler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedulerId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(`Committed: ${data.commitMessage}`)
      loadSchedulers()
      if (expandedLog === schedulerId) loadLogs(schedulerId)
    } catch (err: any) {
      showToast(err.message, false)
    } finally {
      setRunningId(null)
    }
  }

  // Load logs
  async function loadLogs(schedulerId: string) {
    const res  = await fetch(`/api/scheduler/${schedulerId}/logs`)
    const data = await res.json()
    if (data.logs) setLogs(prev => ({ ...prev, [schedulerId]: data.logs }))
  }

  function toggleLogs(schedulerId: string) {
    if (expandedLog === schedulerId) {
      setExpandedLog(null)
    } else {
      setExpandedLog(schedulerId)
      loadLogs(schedulerId)
    }
  }

  const cronExpr = form.schedulePreset === 'custom' ? form.customCron : form.schedulePreset

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:999, padding:'12px 18px', borderRadius:12, background: toast.ok ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)', border:`1px solid ${toast.ok ? 'rgba(52,211,153,.3)' : 'rgba(248,113,113,.3)'}`, color: toast.ok ? '#34D399' : '#F87171', fontSize:13, fontWeight:600, boxShadow:'0 8px 30px rgba(0,0,0,.4)', animation:'fadeScale .2s ease' }}>
          {toast.ok ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="📅" className="inline" /> Commit Scheduler</span>
      </div>

      <div className="page-content" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

        {/* ── LEFT: Create Form ── */}
        <div>
          <div className="card fu d1" style={{ marginBottom:24 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:18 }}><EmojiIcon emoji="⚡" className="inline" /> Create New Scheduler</div>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Repo */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>GitHub Repository</label>
                {reposLoading ? (
                  <div style={{ height:40, background:'rgba(255,255,255,.05)', borderRadius:9, animation:'pulse 1.5s ease infinite' }} />
                ) : (
                  <select
                    id="repo-select"
                    className="input"
                    value={form.repoFullName}
                    onChange={e => setForm(f => ({ ...f, repoFullName: e.target.value }))}
                    required
                    style={{ appearance:'none' }}
                  >
                    <option value="">Select a repository…</option>
                    {repos.map(r => (
                      <option key={r.full_name} value={r.full_name}>
                        {r.full_name}{r.private ? ' 🔒' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* File path */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>File Path</label>
                <input className="input" placeholder="src/utils/helpers.ts" value={form.filePath} onChange={e => setForm(f => ({ ...f, filePath: e.target.value }))} required />
              </div>

              {/* Language */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>Language</label>
                <select className="input" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={{ appearance:'none' }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>What to generate</label>
                <textarea className="input" rows={3} placeholder="e.g. Add utility functions for data formatting and validation" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ resize:'vertical' }} />
              </div>

              {/* Schedule */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.9px', display:'block', marginBottom:7 }}>Schedule</label>
                <select className="input" value={form.schedulePreset} onChange={e => setForm(f => ({ ...f, schedulePreset: e.target.value }))} style={{ appearance:'none', marginBottom: form.schedulePreset === 'custom' ? 8 : 0 }}>
                  {SCHEDULE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {form.schedulePreset === 'custom' && (
                  <input className="input" placeholder="0 9 * * * (cron expression)" value={form.customCron} onChange={e => setForm(f => ({ ...f, customCron: e.target.value }))} style={{ fontFamily:'monospace', fontSize:13 }} />
                )}
              </div>

              <button
                id="create-scheduler-btn"
                type="submit"
                disabled={creating || !form.repoFullName || !form.description}
                className="btn btn-primary"
                style={{ width:'100%', justifyContent:'center', marginTop:4, opacity: (!form.repoFullName || !form.description) ? 0.5 : 1 }}
              >
                {creating ? (
                  <><span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Creating…</>
                ) : '+ Create Scheduler'}
              </button>
            </form>
          </div>

          {/* How it works */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'🤖', title:'AI writes real code', desc:'Claude generates actual working code improvements each run — not fake commits.' },
              { icon:'📅', title:'Pushed on schedule', desc:'Commits go out at natural times. Your history looks authentic to recruiters.' },
              { icon:'📋', title:'Full audit log', desc:'Every commit is logged with SHA, message, and timestamp.' },
            ].map(tip => (
              <div key={tip.title} style={{ background:'rgba(99,102,241,.05)', border:'1px solid rgba(99,102,241,.15)', borderRadius:10, padding:'12px 14px', display:'flex', gap:12 }}>
                <span style={{ fontSize:20, flexShrink:0 }}><EmojiIcon emoji={tip.icon} /></span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#fff', marginBottom:2 }}>{tip.title}</div>
                  <p style={{ fontSize:11, color:'var(--gray)', lineHeight:1.5 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Active Schedulers ── */}
        <div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>
            Active Schedulers ({schedulers.length})
          </div>

          {listLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2].map(i => <div key={i} style={{ height:100, background:'rgba(255,255,255,.05)', borderRadius:12, animation:'pulse 1.5s ease infinite' }} />)}
            </div>
          ) : schedulers.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'48px 24px', opacity:0.6 }}>
              <div style={{ fontSize:32, marginBottom:12 }}><EmojiIcon emoji="📅" className="inline" /></div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 }}>No schedulers yet</div>
              <p style={{ fontSize:13, color:'var(--gray)' }}>Create your first commit scheduler on the left.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {schedulers.map(s => (
                <div key={s.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                  {/* Scheduler header */}
                  <div style={{ padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>
                          {s.repo_name}
                          <span style={{ fontSize:10, fontFamily:'monospace', color:'var(--dim)', marginLeft:8 }}>/{s.file_path}</span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--gray)' }}>{humanCron(s.cron_expression)} · {s.language}</div>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:100,
                        background: s.status === 'active' ? 'rgba(52,211,153,.1)' : 'rgba(245,158,11,.1)',
                        color:      s.status === 'active' ? '#34D399' : '#F59E0B',
                        border:     `1px solid ${s.status === 'active' ? 'rgba(52,211,153,.25)' : 'rgba(245,158,11,.25)'}`,
                      }}>
                        {s.status === 'active' ? '● Active' : '⏸ Paused'}
                      </span>
                    </div>

                    <div style={{ fontSize:11, color:'var(--dim)', marginBottom:12 }}>
                      {s.total_commits} commits pushed
                      {s.last_run_at && ` · Last run ${formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true })}`}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                      <button
                        onClick={() => runNow(s.id)}
                        disabled={runningId === s.id}
                        className="btn btn-primary btn-sm"
                        style={{ opacity: runningId === s.id ? 0.7 : 1 }}
                      >
                        {runningId === s.id ? (
                          <><span style={{ width:12, height:12, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Running…</>
                        ) : '▶ Run Now'}
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, s.status === 'active' ? 'paused' : 'active')}
                        className="btn btn-ghost btn-sm"
                      >
                        {s.status === 'active' ? '⏸ Pause' : '▶ Resume'}
                      </button>
                      <button onClick={() => toggleLogs(s.id)} className="btn btn-ghost btn-sm">
                        {expandedLog === s.id ? 'Hide Logs' : '📋 View Logs'}
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this scheduler?')) updateStatus(s.id, 'deleted') }}
                        className="btn btn-sm"
                        style={{ background:'rgba(248,113,113,.08)', color:'var(--red)', border:'1px solid rgba(248,113,113,.2)', borderRadius:8, marginLeft:'auto' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Logs table */}
                  {expandedLog === s.id && (
                    <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', padding:'12px 18px', background:'rgba(0,0,0,.2)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Commit Log</div>
                      {!logs[s.id] ? (
                        <div style={{ fontSize:12, color:'var(--dim)' }}>Loading…</div>
                      ) : logs[s.id].length === 0 ? (
                        <div style={{ fontSize:12, color:'var(--dim)' }}>No commits yet.</div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {logs[s.id].map(log => (
                            <div key={log.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:8, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)' }}>
                              <span style={{ fontSize:14 }}>{log.success ? '✅' : '❌'}</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:12, color:'#fff', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.commit_message}</div>
                                <div style={{ fontSize:10, color:'var(--dim)', fontFamily:'monospace' }}>
                                  {log.commit_sha ? log.commit_sha.slice(0,7) : '—'}
                                  {' · '}
                                  {formatDistanceToNow(new Date(log.ran_at), { addSuffix: true })}
                                </div>
                              </div>
                              {log.commit_sha && (
                                <a
                                  href={`https://github.com/${s.repo_full_name}/commit/${log.commit_sha}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize:10, color:'var(--sky)', textDecoration:'none' }}
                                >
                                  View ↗
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
