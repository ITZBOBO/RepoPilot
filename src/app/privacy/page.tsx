import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

const LAST_UPDATED = 'March 2025'

export default function PrivacyPage() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.8 }}>{children}</div>
    </section>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--deep)', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 60, borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(7,14,26,.92)', backdropFilter: 'blur(12px)', zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
          RepoPilot
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--gray)' }}>← Back to app</Link>
      </nav>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ marginBottom: 44 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.2)', color: 'var(--sky)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 16 }}>Privacy Policy</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 10 }}>Your privacy matters</h1>
          <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>Last updated: {LAST_UPDATED}. This policy explains what data RepoPilot collects, why, and how it is protected.</p>
        </div>

        <Section title="1. Who we are">
          RepoPilot is a software product built to help developers build better GitHub portfolios using AI-generated project suggestions and tools. By using RepoPilot, you agree to this Privacy Policy.
        </Section>

        <Section title="2. What data we collect">
          <p style={{ marginBottom: 10 }}>We collect only what is necessary to provide the service:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#fff' }}>Account data</strong> — name, email address, and hashed password when you register directly, or your name and email from Google when you use Google sign-in.</li>
            <li><strong style={{ color: '#fff' }}>GitHub data</strong> — when you connect GitHub, we read your public repository list and profile to personalise suggestions. We never read private repositories without explicit permission.</li>
            <li><strong style={{ color: '#fff' }}>Usage data</strong> — pages visited, features used, and actions taken inside the app. This is anonymised and used only to improve RepoPilot.</li>
            <li><strong style={{ color: '#fff' }}>Project data</strong> — project ideas, READMEs, and roadmaps you generate are stored so you can access them later. This content belongs to you.</li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>To provide the RepoPilot service and personalise AI suggestions to your profile</li>
            <li>To publish repositories to your GitHub account when you explicitly request it</li>
            <li>To send product updates if you have opted in — never for advertising</li>
            <li>To diagnose and fix bugs and improve performance</li>
            <li>We do <strong style={{ color: '#fff' }}>not</strong> sell your data to any third party, ever</li>
          </ul>
        </Section>

        <Section title="4. Third-party services">
          <p>RepoPilot uses the following trusted services:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[
              { name: 'Anthropic Claude API', purpose: 'Generates AI project suggestions and README content', policy: 'https://anthropic.com/privacy' },
              { name: 'GitHub API',           purpose: 'Publishing repositories when you authorise it',       policy: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement' },
              { name: 'Google OAuth',         purpose: 'Optional sign-in via your Google account',            policy: 'https://policies.google.com/privacy' },
              { name: 'Stripe',               purpose: 'Payment processing for Pro subscriptions',            policy: 'https://stripe.com/privacy' },
              { name: 'Vercel',               purpose: 'Hosting and edge delivery',                          policy: 'https://vercel.com/legal/privacy-policy' },
            ].map(s => (
              <div key={s.name} style={{ padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)' }}>{s.purpose} — <a href={s.policy} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky)' }}>Privacy policy ↗</a></div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Data storage and security">
          Your data is stored on encrypted servers. Passwords are hashed using bcrypt and never stored in plain text. GitHub tokens are encrypted at rest. We use HTTPS for all data in transit. We do not store payment card details — Stripe handles all payment processing.
        </Section>

        <Section title="6. Your rights">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: '#fff' }}>Access</strong> — you can request a copy of all data we hold about you at any time</li>
            <li><strong style={{ color: '#fff' }}>Correction</strong> — you can update your name and email in Settings at any time</li>
            <li><strong style={{ color: '#fff' }}>Deletion</strong> — you can delete your account in Settings → Danger zone. All data is permanently removed within 30 days</li>
            <li><strong style={{ color: '#fff' }}>Portability</strong> — project data and READMEs can be exported as markdown files on request</li>
          </ul>
        </Section>

        <Section title="7. Cookies">
          RepoPilot uses a session cookie to keep you signed in. We do not use advertising cookies or tracking cookies. There are no third-party analytics cookies unless you consent.
        </Section>

        <Section title="8. Children">
          RepoPilot is not directed at children under 13. If you believe a child has created an account, contact us and we will delete it promptly.
        </Section>

        <Section title="9. Changes to this policy">
          We may update this policy as the product evolves. We will notify you by email and in-app notification of any material changes. Continued use after notification constitutes acceptance.
        </Section>

        <Section title="10. Contact">
          <p>For any privacy questions or data requests: <a href="mailto:privacy@repopilot.dev" style={{ color: 'var(--sky)' }}>privacy@repopilot.dev</a></p>
        </Section>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>Questions about your data?</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="mailto:privacy@repopilot.dev" className="btn btn-ghost btn-sm" style={{ color: 'var(--gray)' }}>Email us</a>
            <Link href="/terms" className="btn btn-secondary btn-sm">Read Terms →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
