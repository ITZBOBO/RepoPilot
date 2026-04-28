'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'

const stats = [
  { label: 'Total Projects', value: '12', change: '+2 this month', color: 'var(--sky)', icon: '🏗️' },
  { label: 'Commits This Month', value: '84', change: '+12% vs last month', color: 'var(--green)', icon: '📦' },
  { label: 'Avg. Completion Rate', value: '73%', change: 'Up from 61%', color: 'var(--amber)', icon: '📈' },
  { label: 'Portfolio Score', value: '62', change: '+4 pts this week', color: 'var(--purple)', icon: '⭐' },
]

const weekly = [32, 55, 41, 78, 63, 90, 47]
const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AnalyticsPage() {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="📊" className="inline" /> Analytics</span>
        <div className="topbar-right">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="page-content">
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }} className="fu d1">
          {stats.map((s, i) => (
            <div key={s.label} className="card card-hover" style={{ padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}><EmojiIcon emoji={s.icon} /></div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>{s.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          {/* Weekly Activity Chart */}
          <div className="card fu d2" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Weekly commit activity</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
              {weekly.map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${(val / 100) * 120}px`,
                      background: `linear-gradient(180deg, var(--sky), var(--blue))`,
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 0 12px rgba(34,211,238,0.25)',
                      transition: 'opacity .2s',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--dim)' }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Projects */}
          <div className="card fu d3" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Top projects by activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Finance Dashboard UI', pct: 90, color: 'var(--amber)' },
                { name: 'Job Application Tracker', pct: 72, color: 'var(--sky)' },
                { name: 'Dev Portfolio v2', pct: 55, color: 'var(--purple)' },
                { name: 'E-Commerce Store', pct: 38, color: 'var(--green)' },
              ].map(p => (
                <div key={p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 4, boxShadow: `0 0 8px ${p.color}` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
