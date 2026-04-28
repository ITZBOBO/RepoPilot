'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const members = [
  { name: 'Alex Rivera', role: 'Frontend Dev', avatar: 'https://i.pravatar.cc/150?img=33', tasks: 4, status: 'Active' },
  { name: 'Sam Chen', role: 'UI Designer', avatar: 'https://i.pravatar.cc/150?img=68', tasks: 2, status: 'Active' },
  { name: 'Jordan Lee', role: 'Backend Dev', avatar: 'https://i.pravatar.cc/150?img=47', tasks: 3, status: 'Away' },
]

export default function TeamPage() {
  const { id } = useParams()
  const [email, setEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setInviteSent(true)
    setEmail('')
    setTimeout(() => setInviteSent(false), 3000)
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="👥" className="inline" /> Team — Project {id?.toString().toUpperCase()}</span>
        <div className="topbar-right">
          <Link href={`/projects/${id}`} className="btn btn-ghost btn-sm">← Back to Project</Link>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Members list */}
          <div className="card fu d1" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Team Members</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {members.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <img src={m.avatar} style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{m.role} · {m.tasks} open tasks</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: m.status === 'Active' ? 'var(--green)' : 'var(--amber)',
                    background: m.status === 'Active' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                    border: `1px solid ${m.status === 'Active' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    padding: '3px 10px', borderRadius: 100
                  }}>
                    {m.status}
                  </span>
                  <button className="btn btn-ghost btn-sm">Assign</button>
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div className="card fu d2" style={{ padding: 28, height: 'fit-content' }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Invite a collaborator</div>
            <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 20, lineHeight: 1.6 }}>Add a team member to collaborate on this project.</p>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px', borderRadius: 10 }}>
                {inviteSent ? '✓ Invite Sent!' : '📨 Send Invite'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
