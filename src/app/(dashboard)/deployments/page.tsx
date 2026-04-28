'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'

const deploys = [
  { project: 'Finance Dashboard UI', env: 'Production', status: 'Live', time: '2 hours ago', url: 'https://finance-dash.vercel.app', color: 'var(--green)', icon: '✅' },
  { project: 'Job Application Tracker', env: 'Preview', status: 'Building', time: '15 min ago', url: '#', color: 'var(--amber)', icon: '🔄' },
  { project: 'Dev Portfolio v2', env: 'Production', status: 'Failed', time: '1 day ago', url: '#', color: 'var(--red)', icon: '❌' },
  { project: 'E-Commerce Store', env: 'Staging', status: 'Live', time: '3 days ago', url: '#', color: 'var(--green)', icon: '✅' },
]

export default function DeploymentsPage() {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="🚀" className="inline" /> Deployments</span>
        <div className="topbar-right">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Back</Link>
          <button className="btn btn-primary btn-sm">+ New Deploy</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }} className="fu d1">
          {[
            { label: 'Total Deployments', value: '24', icon: '🚀', color: 'var(--sky)' },
            { label: 'Active / Live', value: '8', icon: '✅', color: 'var(--green)' },
            { label: 'Failed', value: '2', icon: '❌', color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}><EmojiIcon emoji={s.icon} /></div>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card fu d2">
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Recent Deployments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {deploys.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: i < deploys.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 20 }}><EmojiIcon emoji={d.icon} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{d.project}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>{d.env} · {d.time}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color, background: `${d.color}18`, padding: '3px 10px', borderRadius: 100, border: `1px solid ${d.color}30` }}>{d.status}</span>
                {d.url !== '#' && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--sky)', textDecoration: 'none' }}>Visit ↗</a>
                )}
                <Link href={`/projects/p1/deploy`} className="btn btn-ghost btn-sm">Details</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
