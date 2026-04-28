'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import { useParams } from 'next/navigation'

const slugMap: Record<string, {
  title: string, emoji: string, difficulty: string, days: number,
  score: number, desc: string, stack: string[], features: string[]
}> = {
  'finance-dashboard': {
    title: 'Finance Dashboard UI', emoji: '💰', difficulty: 'Intermediate', days: 6, score: 90,
    desc: 'A clean, data-rich finance dashboard with charts, budgets, and expense tracking — great for showing full-stack data visualization skills.',
    stack: ['React', 'TypeScript', 'Recharts', 'Tailwind'],
    features: ['Monthly income/expense chart', 'Savings goals progress', 'Spending pie chart', 'Account balance cards'],
  },
  'job-application-tracker': {
    title: 'Job Application Tracker', emoji: '📋', difficulty: 'Intermediate', days: 5, score: 85,
    desc: 'Track job applications with a Kanban-style board, interview dates, and status updates. Perfect for your portfolio and actually useful.',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    features: ['Kanban board (Applied / Interview / Offer)', 'Email reminders', 'Company notes', 'Stats dashboard'],
  },
  'dev-portfolio-v2': {
    title: 'Dev Portfolio v2', emoji: '🎨', difficulty: 'Advanced', days: 8, score: 78,
    desc: 'A stunning next-gen developer portfolio with animated sections, project showcases, and an integrated blog — the ultimate first impression.',
    stack: ['Next.js', 'Framer Motion', 'MDX', 'TypeScript'],
    features: ['Animated hero section', 'Project showcase grid', 'MDX blog', 'Dark/light mode'],
  },
}

export default function SuggestedProjectPage() {
  const { slug } = useParams()
  const key = slug?.toString() ?? ''
  const project = slugMap[key]

  if (!project) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}><EmojiIcon emoji="🤔" className="inline" /></div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, color: '#fff', marginBottom: 12 }}>Suggestion not found</h2>
        <Link href="/suggestions" className="btn btn-primary">View all suggestions</Link>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="💡" className="inline" /> Suggested Project</span>
        <div className="topbar-right">
          <Link href="/suggestions" className="btn btn-ghost btn-sm">← All Suggestions</Link>
          <Link href="/projects" className="btn btn-primary btn-sm">Start Building</Link>
        </div>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="card fu d1" style={{ padding: 36, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 56 }}><EmojiIcon emoji={project.emoji} /></div>
              <div>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{project.title}</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-amber">{project.difficulty}</span>
                  <span className="badge badge-gray">{project.days} days</span>
                  <span className="badge badge-blue">Fit score: {project.score}%</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8 }}>{project.desc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card fu d2" style={{ padding: 28 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}><EmojiIcon emoji="🛠" className="inline" /> Tech Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.stack.map(t => (
                  <span key={t} style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, fontSize: 12, color: 'var(--sky)', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="card fu d3" style={{ padding: 28 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}><EmojiIcon emoji="✨" className="inline" /> Key Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {project.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</div>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/projects" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #22D3EE)' }}>
              <EmojiIcon emoji="🚀" className="inline" /> Start this project
            </Link>
            <Link href="/suggestions" className="btn btn-ghost" style={{ padding: '12px 24px' }}>See other suggestions</Link>
          </div>
        </div>
      </div>
    </>
  )
}
