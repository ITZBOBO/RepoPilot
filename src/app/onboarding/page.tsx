'use client'
import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const PILLS = ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'PostgreSQL', 'MongoDB', 'Django', 'Flutter', 'Go', 'Rust']

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [skillLevel, setSkillLevel] = useState<string>('')
  const [goal, setGoal] = useState<string>('')
  
  const [stack, setStack] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  const togglePill = (pill: string) => {
    if (stack.includes(pill)) {
      setStack(stack.filter(s => s !== pill))
    } else {
      setStack([...stack, pill])
    }
  }

  const addCustomTag = () => {
    const trimmed = customTag.trim()
    if (trimmed && !stack.includes(trimmed)) {
      setStack([...stack, trimmed])
    }
    setCustomTag('')
  }

  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!skillLevel) return setError('Please select your experience level.')
    if (!goal) return setError('Please select your main goal.')
    if (stack.length === 0) return setError('Please select or add at least one technology in your stack.')

    setLoading(true)
    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillLevel, goal, stack })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences')

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div style={{ minHeight: '100vh', background: '#060C18', color: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: 'rgba(14,24,46,.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,.12)', borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 540 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Welcome to RepoPilot ✦</h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Let's personalize your experience. We use this to generate perfectly tailored project ideas.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#FCA5A5', padding: '12px 16px', borderRadius: 8, fontSize: 13, textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Level */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 12 }}>What's your experience level?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSkillLevel(lvl)}
                  style={{
                    padding: '12px 0', background: skillLevel === lvl ? 'rgba(99,102,241,.15)' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${skillLevel === lvl ? '#6366F1' : 'rgba(255,255,255,.08)'}`,
                    borderRadius: 8, color: skillLevel === lvl ? '#fff' : '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all .2s'
                  }}
                >
                  {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 12 }}>What's your main goal?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { id: 'job', label: 'Get a job' },
                { id: 'freelance', label: 'Build a portfolio' },
                { id: 'learning', label: 'Learn new skills' },
                { id: 'internship', label: 'Win a hackathon / Internship' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  style={{
                    padding: '12px 16px', background: goal === g.id ? 'rgba(99,102,241,.15)' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${goal === g.id ? '#6366F1' : 'rgba(255,255,255,.08)'}`,
                    borderRadius: 8, color: goal === g.id ? '#fff' : '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                    transition: 'all .2s'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 8 }}>What's your primary stack?</label>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Select all that apply, or add your own.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PILLS.map(pill => {
                const isActive = stack.includes(pill)
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => togglePill(pill)}
                    style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      background: isActive ? 'rgba(99,102,241,.2)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${isActive ? '#818CF8' : 'transparent'}`,
                      color: isActive ? '#fff' : '#94A3B8', transition: 'all .15s'
                    }}
                  >
                    {pill}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {stack.filter(s => !PILLS.includes(s)).map(custom => (
                 <div key={custom} style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: 'rgba(99,102,241,.2)', border: '1px solid #818CF8', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                   {custom}
                   <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => togglePill(custom)}>×</span>
                 </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="Add other tech (e.g. Docker)" 
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                style={{ flex: 1, background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.1)', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={addCustomTag}
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', padding: '0 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: 12, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? 'rgba(99,102,241,.5)' : 'linear-gradient(135deg,#6366F1,#22D3EE)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(99,102,241,.3)', transition: 'all .2s'
            }}
          >
            {loading ? 'Saving...' : 'Go to Dashboard →'}
          </button>
        </form>

      </div>
    </div>
  )
}
