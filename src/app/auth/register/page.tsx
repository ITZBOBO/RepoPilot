'use client'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // If already authenticated, go to onboarding
  useEffect(() => {
    if (status === 'authenticated') router.replace('/onboarding')
  }, [status, router])

  async function handleGitHubSignUp() {
    setLoading(true)
    if (process.env.NODE_ENV === 'development') {
      await signIn('credentials', { username: 'test', password: 'test', callbackUrl: '/onboarding' })
    } else {
      await signIn('github', { callbackUrl: '/onboarding' })
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center', textDecoration: 'none' }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg,#6366F1,#22D3EE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, boxShadow: '0 0 20px rgba(99,102,241,.5)',
          }}>✦</span>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 19, color: '#fff', letterSpacing: '-0.4px' }}>
            RepoPilot
          </span>
        </Link>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)',
            color: '#34D399', fontSize: 11, fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', padding: '5px 16px', borderRadius: 100, marginBottom: 20,
          }}>✦ Free · No credit card</span>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 23, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gray)', fontWeight: 400, lineHeight: 1.7 }}>
            Connect GitHub to get AI-powered project ideas,<br />
            roadmaps, and automated commits.
          </p>
        </div>

        {/* GitHub sign-up button */}
        <button
          id="github-signup-btn"
          onClick={handleGitHubSignUp}
          disabled={loading || status === 'loading'}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: loading ? 'rgba(99,102,241,.5)' : 'linear-gradient(135deg,#6366F1,#22D3EE)',
            border: 'none',
            borderRadius: 12, padding: '15px 20px',
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all .2s',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(99,102,241,.4)',
          }}
        >
          {loading ? (
            <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          {loading ? 'Connecting to GitHub…' : 'Sign up with GitHub'}
        </button>

        {/* What happens next */}
        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '✦', text: 'Tell us your goals and tech stack' },
            { icon: '💡', text: 'Get 6 AI-tailored project ideas instantly' },
            { icon: '🚀', text: 'Get a full roadmap, README, and commit plan' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--gray)' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Scope notice */}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
          RepoPilot requests <strong style={{ color: 'var(--gray)' }}>read:user · user:email · repo</strong> permissions.<br />
          The repo scope is needed to publish repos on your behalf.
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--sky)' }}>Sign in</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--sky)' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: 'var(--sky)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
