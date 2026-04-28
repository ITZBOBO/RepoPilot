'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const STEPS = ['Connecting to GitHub', 'Installing dependencies', 'Running build', 'Running tests', 'Uploading assets', 'Going live 🎉']

export default function DeployPage() {
  const { id } = useParams()
  const [deploying, setDeploying] = useState(false)
  const [step, setStep] = useState(-1)
  const [done, setDone] = useState(false)

  async function startDeploy() {
    setDeploying(true)
    setDone(false)
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    }
    setDone(true)
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="🚀" className="inline" /> Deploy Project</span>
        <div className="topbar-right">
          <Link href={`/projects/${id}`} className="btn btn-ghost btn-sm">← Back to Project</Link>
        </div>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card fu d1" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{done ? '🎉' : '🚀'}</div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {done ? 'Deployed Successfully!' : deploying ? 'Deploying…' : 'Deploy to Production'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 32 }}>
              {done
                ? 'Your project is now live! Share the link below.'
                : 'Push your latest build live. This will run your CI/CD pipeline and publish to Vercel.'}
            </p>

            {deploying && (
              <div style={{ textAlign: 'left', marginBottom: 32 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: i < step ? 'var(--green)' : i === step ? 'var(--sky)' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700,
                      boxShadow: i === step ? '0 0 10px rgba(34,211,238,0.5)' : 'none',
                      transition: 'all .3s'
                    }}>
                      {i < step ? '✓' : i === step ? '↻' : ''}
                    </div>
                    <span style={{ fontSize: 13, color: i <= step ? '#fff' : 'var(--dim)', transition: 'color .3s' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {done && (
              <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16 }}><EmojiIcon emoji="🔗" className="inline" /></span>
                <a href="https://finance-dash.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--sky)', fontWeight: 600 }}>
                  https://finance-dash.vercel.app
                </a>
              </div>
            )}

            {!deploying && !done && (
              <button onClick={startDeploy} className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 15, borderRadius: 12 }}>
                <EmojiIcon emoji="🚀" className="inline" /> Start Deployment
              </button>
            )}
            {done && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={startDeploy} className="btn btn-ghost">Redeploy</button>
                <Link href="/deployments" className="btn btn-primary">View all deployments</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
