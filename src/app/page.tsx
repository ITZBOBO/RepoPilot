import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import SignInButton from '@/components/ui/SignInButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RepoPilot — AI GitHub Assistant for Developers',
  description: 'Build the portfolio projects that get you hired. AI-powered suggestions, roadmaps, and GitHub publishing.',
  openGraph: { title: 'RepoPilot', description: 'Build projects that get you hired.', type: 'website' },
}

const FEATURES = [
  { icon:'💡', t:'AI Project Suggestions',  d:'6 tailored ideas with difficulty, estimated time, and why each fits your exact situation.' },
  { icon:'🗺️', t:'Full Build Roadmap',       d:'Phase-by-phase plan with tasks and daily schedule so you always know what to build next.' },
  { icon:'📦', t:'Repo Generator',           d:'Auto-write a professional README, commit plan, and GitHub issues before you write code.' },
  { icon:'🚀', t:'One-Click Publish',        d:'Push the repo shell to GitHub with one click. Your code, your commits, your portfolio.' },
  { icon:'⚡', t:'Quick Prompts',            d:'Answer 3 questions — RepoPilot builds the perfect AI prompt for you. No experience needed.' },
  { icon:'📊', t:'Portfolio Score',          d:'See how your GitHub looks to recruiters and exactly what to build to close the gaps.' },
]
const STEPS = [
  { n:'01', t:'Tell us about yourself',     d:'Skill level, stack, goal, time available. 60 seconds.' },
  { n:'02', t:'Get 6 tailored suggestions', d:'AI matches projects to you with fit scores and build strategies.' },
  { n:'03', t:'Pick one, get a roadmap',    d:'Phase-by-phase tasks, time estimates, commit guidance.' },
  { n:'04', t:'Build and publish',          d:'Write the code, push to GitHub, watch your score climb.' },
]
const TESTIMONIALS = [
  { name:'Adaeze O.',    role:'CS Student, UNILAG',        t:'I had no idea what to build. RepoPilot gave me 6 ideas in 10 seconds and I finished 2 already.' },
  { name:'Tunde F.',     role:'Self-taught dev, Lagos',     t:'The roadmap breaks everything into daily tasks so I never get stuck wondering what to do next.' },
  { name:'Chiamaka R.', role:'Bootcamp grad, job hunting', t:'Landed my first internship interview after adding 2 RepoPilot projects to my GitHub. 🔥' },
]

const GLOW_STYLE = { pointerEvents:'none' as const, position:'absolute' as const }

export default function LandingPage() {

  return (
    <div style={{ minHeight:'100vh', background:'#060C18', fontFamily:"'Inter','DM Sans',sans-serif", color:'#E2E8F0', overflowX:'hidden' }}>

      {/* Nav */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 48px', height:66,
        borderBottom:'1px solid rgba(99,102,241,.1)',
        position:'sticky', top:0,
        background:'rgba(6,12,24,.82)',
        backdropFilter:'blur(20px) saturate(1.3)',
        WebkitBackdropFilter:'blur(20px) saturate(1.3)',
        zIndex:20,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#fff', letterSpacing:'-0.3px' }}>
          <span style={{
            width:30, height:30, borderRadius:8,
            background:'linear-gradient(135deg,#6366F1,#22D3EE)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, boxShadow:'0 0 18px rgba(99,102,241,.5)',
          }}>✦</span>
          RepoPilot
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link href="/auth/login" style={{ fontSize:13, color:'#94A3B8', fontWeight:500, padding:'8px 18px', textDecoration:'none', transition:'color .15s' }}>
            Sign in
          </Link>
          <SignInButton text="Get started free →" style={{
            fontSize:13, fontWeight:600, padding:'9px 22px', borderRadius:10,
            boxShadow:'0 4px 18px rgba(99,102,241,.4)', transition:'transform .2s, box-shadow .2s',
          }} />
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'100px 24px 80px', position:'relative', overflow:'hidden' }}>
        {/* Glow blobs */}
        <div style={{ ...GLOW_STYLE, top:-160, left:'50%', transform:'translateX(-50%)', width:750, height:550,
          background:'radial-gradient(ellipse, rgba(99,102,241,.16) 0%, rgba(34,211,238,.08) 50%, transparent 70%)',
          animation:'floatBlob 9s ease-in-out infinite',
        }} />
        <div style={{ ...GLOW_STYLE, bottom:-80, left:'10%', width:400, height:400,
          background:'radial-gradient(ellipse, rgba(34,211,238,.08) 0%, transparent 65%)',
          animation:'floatBlob 12s ease-in-out infinite reverse',
        }} />

        {/* Badge */}
        <span style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.2)',
          color:'#818CF8', fontSize:11, fontWeight:700, letterSpacing:'1px',
          textTransform:'uppercase', padding:'5px 18px', borderRadius:100, marginBottom:28,
        }}>✦ AI-powered · Free to start</span>

        <h1 style={{
          fontFamily:'Syne,sans-serif', fontSize:56, fontWeight:800, color:'#fff',
          letterSpacing:-2, lineHeight:1.08, marginBottom:22, maxWidth:680, margin:'0 auto 22px',
        }}>
          Build the GitHub projects that<br />
          <span style={{ background:'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            actually get you hired
          </span>
        </h1>

        <p style={{ fontSize:17, color:'#94A3B8', fontWeight:400, lineHeight:1.8, maxWidth:500, margin:'0 auto 44px' }}>
          Tell RepoPilot your goals and stack. Get 6 portfolio-perfect project ideas, a full roadmap, and a GitHub-ready README — in seconds.
        </p>

        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <SignInButton icon="🚀" text="Start for free" style={{
            fontSize:15, fontWeight:700, padding:'15px 36px',
            borderRadius:13, boxShadow:'0 6px 28px rgba(99,102,241,.5)',
            transition:'transform .2s, box-shadow .2s',
          }} />
          <Link href="/dashboard" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(99,102,241,.07)',
            border:'1px solid rgba(99,102,241,.16)',
            color:'#E2E8F0', fontSize:15, fontWeight:600, padding:'15px 30px',
            borderRadius:13, textDecoration:'none', transition:'all .2s',
          }}>
            <EmojiIcon emoji="👀" className="inline" /> See the demo
          </Link>
        </div>
        <p style={{ marginTop:20, fontSize:12, color:'#475569' }}>No credit card · 3 free suggestions per month</p>
      </section>

      {/* How it works */}
      <section style={{ padding:'60px 40px 80px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color:'#fff', letterSpacing:-0.8, marginBottom:12 }}>How it works</h2>
          <p style={{ fontSize:15, color:'#94A3B8', fontWeight:400 }}>From zero to published GitHub repo in under an hour</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className="step-card" style={{
              background:'rgba(14,24,46,.6)',
              backdropFilter:'blur(16px)',
              border:'1px solid rgba(99,102,241,.12)',
              borderRadius:18, padding:'28px 28px', position:'relative', overflow:'hidden',
            }}>
              <div style={{
                position:'absolute', top:-14, right:16,
                fontFamily:'Syne,sans-serif', fontSize:80, fontWeight:800,
                color:'rgba(99,102,241,.06)', lineHeight:1, userSelect:'none',
              }}>{s.n}</div>
              <div style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:9,
                background:'linear-gradient(135deg,rgba(99,102,241,.2),rgba(34,211,238,.15))',
                border:'1px solid rgba(99,102,241,.2)',
                fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, color:'#818CF8',
                letterSpacing:'1px', marginBottom:12,
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 }}>{s.t}</div>
              <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.7 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'60px 40px 80px', maxWidth:1000, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color:'#fff', letterSpacing:-0.8, marginBottom:12 }}>Everything you need</h2>
          <p style={{ fontSize:15, color:'#94A3B8', fontWeight:400 }}>From first idea to published repo — all in one place</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {FEATURES.map((f, i) => (
            <div key={f.t} className="feature-card" style={{
              background:'rgba(14,24,46,.6)',
              backdropFilter:'blur(16px)',
              border:'1px solid rgba(99,102,241,.11)',
              borderRadius:18, padding:'26px 22px',
            }}>
              <div style={{
                width:44, height:44, borderRadius:12,
                background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(34,211,238,.1))',
                border:'1px solid rgba(99,102,241,.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, marginBottom:14,
              }}><EmojiIcon emoji={f.icon} /></div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:8 }}>{f.t}</div>
              <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.7 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'60px 40px 80px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color:'#fff', letterSpacing:-0.8 }}>Developers love it</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background:'rgba(14,24,46,.6)',
              backdropFilter:'blur(16px)',
              border:'1px solid rgba(99,102,241,.11)',
              borderRadius:18, padding:'24px 22px',
            }}>
              <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                {[...Array(5)].map((_,i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize:13, color:'#CBD5E1', lineHeight:1.75, fontStyle:'italic', marginBottom:16 }}>"{t.t}"</p>
              <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{t.name}</div>
              <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding:'60px 40px 80px', maxWidth:680, margin:'0 auto', textAlign:'center' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color:'#fff', letterSpacing:-0.8, marginBottom:12 }}>Simple pricing</h2>
        <p style={{ fontSize:15, color:'#94A3B8', marginBottom:48 }}>Start free. Upgrade when ready.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            {
              name:'Free', price:'$0', period:'forever',
              border:'rgba(99,102,241,.12)',
              feats:['3 suggestions/month','1 draft project','README generation','Community support'],
              cta:'Get started', href:'/auth/register',
              ctaStyle:{ background:'rgba(99,102,241,.08)', color:'#E2E8F0', border:'1px solid rgba(99,102,241,.16)' },
              badge:'',
            },
            {
              name:'Pro', price:'$9', period:'/month',
              border:'rgba(99,102,241,.35)',
              feats:['Unlimited suggestions','Unlimited projects','GitHub publishing','Commit planner','Portfolio score','Priority support'],
              cta:'Start Pro →', href:'/auth/login',
              ctaStyle:{ background:'linear-gradient(135deg,#6366F1,#22D3EE)', color:'#fff', border:'none', boxShadow:'0 6px 24px rgba(99,102,241,.4)' },
              badge:'Most popular',
              highlight:true,
            },
          ].map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? 'rgba(16,26,54,.8)' : 'rgba(14,24,46,.6)',
              backdropFilter:'blur(16px)',
              border:`1.5px solid ${plan.border}`,
              borderRadius:20, padding:'30px 24px', position:'relative', textAlign:'left',
              boxShadow: plan.highlight ? '0 0 48px rgba(99,102,241,.12)' : 'none',
            }}>
              {plan.badge && (
                <div style={{
                  position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)',
                  background:'linear-gradient(135deg,#6366F1,#22D3EE)',
                  color:'#fff', fontSize:10, fontWeight:700,
                  padding:'3px 16px', borderRadius:100, whiteSpace:'nowrap',
                }}>{plan.badge}</div>
              )}
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>{plan.name}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:20 }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:38, fontWeight:800, color:'#fff' }}>{plan.price}</span>
                <span style={{ fontSize:13, color:'#94A3B8' }}>{plan.period}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                {plan.feats.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13, color:'#E2E8F0' }}>
                    <span style={{
                      width:18, height:18, borderRadius:'50%',
                      background:'rgba(52,211,153,.12)', border:'1px solid rgba(52,211,153,.25)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:9, color:'#34D399', flexShrink:0, fontWeight:700,
                    }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href={plan.href} style={{
                display:'block', textAlign:'center', padding:'12px 20px', borderRadius:12,
                fontSize:14, fontWeight:700, textDecoration:'none', transition:'all .2s',
                ...plan.ctaStyle,
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
        <p style={{ marginTop:20, fontSize:12, color:'#475569' }}>
          <EmojiIcon emoji="🎉" className="inline" /> Early access: <strong style={{ color:'#FBBF24' }}>$49 lifetime deal</strong> — limited spots
        </p>
      </section>

      {/* Final CTA */}
      <section style={{ padding:'40px 40px 100px', textAlign:'center' }}>
        <div style={{
          background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(34,211,238,.06))',
          border:'1px solid rgba(99,102,241,.2)',
          borderRadius:26, padding:'60px 40px', maxWidth:580, margin:'0 auto',
          backdropFilter:'blur(16px)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', top:-80, right:-60, width:300, height:300,
            background:'radial-gradient(ellipse, rgba(34,211,238,.08), transparent 65%)',
            pointerEvents:'none',
          }} />
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:33, fontWeight:800, color:'#fff', letterSpacing:-0.8, marginBottom:14 }}>
            Ready to build something real?
          </h2>
          <p style={{ fontSize:15, color:'#94A3B8', marginBottom:32, lineHeight:1.7 }}>
            Join hundreds of developers using RepoPilot to build portfolios that land jobs.
          </p>
          <SignInButton icon="🚀" text="Start for free — no card needed" style={{
            fontSize:15, fontWeight:700, padding:'15px 38px',
            borderRadius:13, boxShadow:'0 6px 28px rgba(99,102,241,.5)',
          }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop:'1px solid rgba(99,102,241,.1)',
        padding:'28px 48px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:14,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'#fff' }}>
          <span style={{
            width:22, height:22, borderRadius:6,
            background:'linear-gradient(135deg,#6366F1,#22D3EE)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10, boxShadow:'0 0 12px rgba(99,102,241,.4)',
          }}>✦</span>
          RepoPilot
        </div>
        <p style={{ fontSize:12, color:'#475569' }}>© 2025 RepoPilot. Built for developers by a developer.</p>
        <div style={{ display:'flex', gap:20 }}>
          {[{l:'Privacy',h:'/privacy'},{l:'Terms',h:'/terms'},{l:'Contact',h:'mailto:hello@repopilot.dev'}].map(({l,h}) => (
            <a key={l} href={h} className="footer-link" style={{ fontSize:12, color:'#475569', textDecoration:'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
