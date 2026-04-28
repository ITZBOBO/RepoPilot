import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms & Conditions' }

export default function TermsPage() {
  const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{n}. {title}</h2>
      <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.8 }}>{children}</div>
    </section>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--deep)', fontFamily: "'DM Sans',sans-serif" }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 60, borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(7,14,26,.92)', backdropFilter: 'blur(12px)', zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
          RepoPilot
        </Link>
        <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--gray)' }}>← Back to app</Link>
      </nav>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ marginBottom: 44 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', color: 'var(--amber)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 16 }}>Terms & Conditions</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 10 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>Last updated: March 2025. By using RepoPilot you agree to these terms. Please read them carefully.</p>
        </div>

        <Section n="1" title="Acceptance of terms">
          By creating a RepoPilot account or using our service in any way, you agree to be bound by these Terms of Service. If you do not agree, do not use RepoPilot. We may update these terms — you will be notified of material changes by email and in-app notification.
        </Section>

        <Section n="2" title="What RepoPilot provides">
          <p style={{ marginBottom: 10 }}>RepoPilot provides:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>AI-powered project suggestion tools based on your developer profile</li>
            <li>Build roadmaps, README generators, and commit plan tools</li>
            <li>Optional publishing of repository shells to your connected GitHub account</li>
            <li>A portfolio scoring tool based on publicly available GitHub data</li>
          </ul>
          <p style={{ marginTop: 10 }}>RepoPilot is a tool to assist developers. All code you write, commit, and push to GitHub remains your own work. We do not write code on your behalf without your explicit review and approval.</p>
        </Section>

        <Section n="3" title="Your account">
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>You must be at least 13 years old to use RepoPilot</li>
            <li>You are responsible for keeping your account credentials secure</li>
            <li>You must not share your account with others or use another person's account</li>
            <li>You must provide accurate information when registering</li>
            <li>We reserve the right to suspend accounts that violate these terms</li>
          </ul>
        </Section>

        <Section n="4" title="Acceptable use">
          <p style={{ marginBottom: 10 }}>You agree not to use RepoPilot to:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Generate or publish content that is illegal, harmful, or abusive</li>
            <li>Attempt to reverse-engineer, scrape, or extract our AI models or systems</li>
            <li>Create fake GitHub activity intended to deceive employers in a fraudulent way</li>
            <li>Resell or sublicense access to RepoPilot without written permission</li>
            <li>Circumvent usage limits or attempt unauthorised access to our systems</li>
          </ul>
        </Section>

        <Section n="5" title="Content ownership">
          Content you create using RepoPilot (READMEs, project descriptions, roadmaps) belongs to you. By using RepoPilot you grant us a limited licence to store and process this content to provide the service. We do not claim ownership of your content and will not use it to train AI models without your consent.
        </Section>

        <Section n="6" title="Free and Pro plans">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Free plan</div>
              <p style={{ fontSize: 13, color: 'var(--gray)' }}>3 AI suggestions per month, 1 active project, README generation. No credit card required. Free plan features may change with notice.</p>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--card)', border: '1px solid rgba(37,99,235,.25)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sky)', marginBottom: 4 }}>Pro plan — $9/month or $49 lifetime</div>
              <p style={{ fontSize: 13, color: 'var(--gray)' }}>Monthly subscriptions can be cancelled at any time. You retain Pro access until the end of your billing period. Lifetime access is a one-time payment with no further charges. Refunds are available within 14 days of purchase if you have not published more than 3 repositories.</p>
            </div>
          </div>
        </Section>

        <Section n="7" title="GitHub integration">
          When you connect your GitHub account, you authorise RepoPilot to act on your behalf within the scope of permissions you grant. We only create repositories, push READMEs, and add topics when you explicitly initiate a publish action. We will never delete your repositories, push code without your review, or access private repositories beyond what you permit.
        </Section>

        <Section n="8" title="Limitation of liability">
          RepoPilot is provided "as is". We make no guarantees about uptime, accuracy of AI-generated content, or employment outcomes. To the maximum extent permitted by law, RepoPilot is not liable for indirect, incidental, or consequential damages arising from use of the service.
        </Section>

        <Section n="9" title="Termination">
          You may delete your account at any time from Settings. We may suspend or terminate accounts that violate these terms, with notice where possible. On termination, your data will be deleted within 30 days per our Privacy Policy.
        </Section>

        <Section n="10" title="Governing law">
          These terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be resolved through good-faith negotiation first. If unresolved, they will be subject to the jurisdiction of the courts of Lagos State.
        </Section>

        <Section n="11" title="Contact">
          <p>For questions about these terms: <a href="mailto:legal@repopilot.dev" style={{ color: 'var(--sky)' }}>legal@repopilot.dev</a></p>
        </Section>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>Have a legal question?</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="mailto:legal@repopilot.dev" className="btn btn-ghost btn-sm" style={{ color: 'var(--gray)' }}>Contact us</a>
            <Link href="/privacy" className="btn btn-secondary btn-sm">Privacy Policy →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
