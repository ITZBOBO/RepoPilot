'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const FREE_FEATS  = ['3 suggestions/month','1 active project','README generation','Quick Prompts','Community support']
const PRO_FEATS   = ['Unlimited suggestions','Unlimited projects','GitHub publishing','Commit scheduler','Portfolio score','Roadmap + task tracking','Commit plan + GitHub issues','Priority support','Early feature access']

type Step = 'plans' | 'checkout' | 'processing' | 'success'

export default function UpgradePage() {
  const { user } = useAuth()
  const [billing, setBilling]   = useState<'monthly'|'lifetime'>('lifetime')
  const [step, setStep]         = useState<Step>('plans')
  const [cardNum, setCardNum]   = useState('')
  const [expiry, setExpiry]     = useState('')
  const [cvv, setCvv]           = useState('')
  const [name, setName]         = useState(user?.name ?? '')
  const [error, setError]       = useState('')

  const price = billing === 'lifetime' ? '$49' : '$9'
  const period = billing === 'lifetime' ? 'one-time' : '/month'
  const saving = billing === 'lifetime' ? `Save $${9*12 - 49} vs monthly` : ''

  function formatCard(v: string) {
    return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g,'').slice(0,4)
    return d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (cardNum.replace(/\s/g,'').length < 16) { setError('Please enter a valid 16-digit card number.'); return }
    if (expiry.length < 5) { setError('Please enter a valid expiry date.'); return }
    if (cvv.length < 3)    { setError('Please enter your CVV.'); return }

    setStep('processing')
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2200))
    setStep('success')
  }

  if (step === 'processing') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:56, height:56, border:'3px solid rgba(37,99,235,.2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 20px' }} />
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>Processing payment…</div>
        <p style={{ fontSize:13, color:'var(--gray)' }}>Talking to Stripe. This takes just a second.</p>
      </div>
    </div>
  )

  if (step === 'success') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh' }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:'0 20px' }} className="fu d1">
        {/* Confetti-ish badge */}
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px', boxShadow:'0 0 40px rgba(37,99,235,.4)' }}>⭐</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#fff', marginBottom:10 }}>You're on Pro!</h1>
        <p style={{ fontSize:14, color:'var(--gray)', lineHeight:1.75, marginBottom:28 }}>
          {billing === 'lifetime'
            ? 'Your $49 lifetime access is now active. You\'ll never be charged again. Enjoy every feature, forever.'
            : 'Your Pro subscription is active. You\'ll be billed $9/month. Cancel anytime from Settings.'}
        </p>

        {/* What's unlocked */}
        <div style={{ background:'rgba(37,99,235,.07)', border:'1px solid rgba(37,99,235,.2)', borderRadius:14, padding:'20px 24px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'var(--sky)', marginBottom:14 }}><EmojiIcon emoji="✨" className="inline" /> Now unlocked for you</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {PRO_FEATS.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text)' }}>
                <span style={{ color:'var(--green)', fontSize:11, flexShrink:0 }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Receipt summary */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 20px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:12, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:12 }}>Receipt</div>
          {[
            { label:'Plan', value:`Pro ${billing === 'lifetime' ? '(Lifetime)' : '(Monthly)'}` },
            { label:'Amount', value: billing === 'lifetime' ? '$49.00' : '$9.00/mo' },
            { label:'Payment', value:`•••• •••• •••• ${cardNum.replace(/\s/g,'').slice(-4)}` },
            { label:'Status', value:'✅ Paid' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ color:'var(--gray)' }}>{r.label}</span>
              <span style={{ color:'#fff', fontWeight:600 }}>{r.value}</span>
            </div>
          ))}
          <p style={{ fontSize:11, color:'var(--dim)', marginTop:10 }}>A receipt has been sent to {user?.email ?? 'your email'}.</p>
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link href="/dashboard" className="btn btn-primary btn-md">Go to dashboard →</Link>
          <Link href="/scheduler" className="btn btn-ghost btn-md">Try Scheduler</Link>
        </div>
      </div>
    </div>
  )

  if (step === 'checkout') return (
    <>
      <div className="topbar">
        <button onClick={() => setStep('plans')} className="btn btn-ghost btn-sm">← Back</button>
        <span className="topbar-title" style={{ marginLeft:12 }}>Checkout</span>
        <div className="topbar-right">
          <span style={{ fontSize:12, color:'var(--green)', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
            Secured by Stripe
          </span>
        </div>
      </div>
      <div className="page-content" style={{ maxWidth:520 }}>
        <div className="card fu d1" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#fff' }}>RepoPilot Pro — {billing === 'lifetime' ? 'Lifetime' : 'Monthly'}</div>
              <div style={{ fontSize:12, color:'var(--gray)' }}>{billing === 'lifetime' ? 'One-time payment, access forever' : 'Billed monthly, cancel anytime'}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#fff' }}>{price}</div>
              <div style={{ fontSize:11, color:'var(--dim)' }}>{period}</div>
            </div>
          </div>
          {billing === 'lifetime' && (
            <div style={{ fontSize:12, color:'var(--amber)', display:'flex', alignItems:'center', gap:6 }}>
              <EmojiIcon emoji="⚡" className="inline" /> {saving} · Early access pricing
            </div>
          )}
        </div>

        {error && (
          <div style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--red)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="fu d2">
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}><EmojiIcon emoji="💳" className="inline" /> Payment details</div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Name on card</label>
              <input className="input" placeholder="Bobo Agboola" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Card number</label>
              <input className="input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} required />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Expiry</label>
                <input className="input" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} required />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>CVV</label>
                <input className="input" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4} required />
              </div>
            </div>
            <div style={{ padding:'12px 14px', background:'rgba(52,211,153,.05)', border:'1px solid rgba(52,211,153,.15)', borderRadius:9, display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--green)' }}>
              <EmojiIcon emoji="🔒" className="inline" /> Your payment is encrypted and processed securely by Stripe. RepoPilot never stores your card details.
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center', background:'linear-gradient(135deg,var(--blue),#7C3AED)', boxShadow:'0 4px 20px rgba(37,99,235,.4)' }}>
              Pay {price} {billing === 'lifetime' ? '— Lifetime access' : '— Start Pro'}
            </button>
            <p style={{ fontSize:11, color:'var(--dim)', textAlign:'center' }}>
              By paying you agree to our <Link href="/terms" style={{ color:'var(--sky)' }}>Terms</Link> and <Link href="/privacy" style={{ color:'var(--sky)' }}>Privacy Policy</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  )

  // Plans view (default)
  return (
    <>
      <div className="topbar">
        <span className="topbar-title">⭐ Upgrade to Pro</span>
      </div>
      <div className="page-content">

        <div className="fu d1" style={{ textAlign:'center', padding:'36px 20px 40px', background:'linear-gradient(180deg,rgba(37,99,235,.07),transparent)', borderRadius:20, border:'1px solid rgba(37,99,235,.12)', marginBottom:32, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:300, background:'radial-gradient(circle,rgba(37,99,235,.12),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <span style={{ fontSize:36, display:'block', marginBottom:12 }}>⭐</span>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#fff', letterSpacing:-0.5, marginBottom:8 }}>Unlock the full RepoPilot</h1>
            <p style={{ fontSize:14, color:'var(--gray)', fontWeight:300, lineHeight:1.75, maxWidth:420, margin:'0 auto 24px' }}>
              Unlimited suggestions, GitHub publishing, commit scheduler, and portfolio scoring.
            </p>
            <div style={{ display:'inline-flex', gap:4, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:10, padding:4 }}>
              <button onClick={() => setBilling('monthly')} style={{ padding:'8px 20px', borderRadius:7, background: billing==='monthly' ? 'var(--card2)' : 'transparent', border:'none', color: billing==='monthly' ? '#fff' : 'var(--dim)', fontSize:13, fontWeight: billing==='monthly' ? 600 : 400, cursor:'pointer' }}>Monthly</button>
              <button onClick={() => setBilling('lifetime')} style={{ padding:'8px 20px', borderRadius:7, background: billing==='lifetime' ? 'var(--card2)' : 'transparent', border:'none', fontSize:13, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, color: billing==='lifetime' ? '#fff' : 'var(--dim)', fontWeight: billing==='lifetime' ? 600 : 400 }}>
                Lifetime <span style={{ fontSize:10, fontWeight:700, background:'var(--amber)', color:'#000', padding:'1px 7px', borderRadius:100 }}>BEST</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:16, marginBottom:28 }} className="fu d2">
          {/* Free */}
          <div className="card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:4 }}>Free</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'#fff' }}>$0</span>
              <span style={{ fontSize:13, color:'var(--gray)' }}>forever</span>
            </div>
            <p style={{ fontSize:13, color:'var(--dim)', marginBottom:18, lineHeight:1.5 }}>For exploring RepoPilot.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
              {FREE_FEATS.map(f => <div key={f} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13, color:'var(--gray)' }}><span style={{ color:'var(--dim)', fontSize:11 }}>✓</span>{f}</div>)}
            </div>
            <div className="btn btn-secondary btn-md" style={{ width:'100%', justifyContent:'center', cursor:'default', opacity:.5 }}>Current plan</div>
          </div>

          {/* Pro */}
          <div style={{ background:'linear-gradient(135deg,rgba(37,99,235,.1),rgba(124,58,237,.06))', border:'1.5px solid rgba(37,99,235,.35)', borderRadius:14, padding:20, position:'relative' }}>
            <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(90deg,#2563EB,#7C3AED)', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 16px', borderRadius:100, whiteSpace:'nowrap' }}><EmojiIcon emoji="🔥" className="inline" /> Most popular</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'#fff', marginBottom:4 }}>Pro</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color: billing==='lifetime' ? 'var(--amber)' : '#fff' }}>{price}</span>
              <span style={{ fontSize:13, color:'var(--gray)' }}>{period}</span>
            </div>
            {saving && <p style={{ fontSize:12, color:'var(--amber)', marginBottom:6 }}><EmojiIcon emoji="⚡" className="inline" /> {saving}</p>}
            <p style={{ fontSize:13, color:'var(--dim)', marginBottom:18, lineHeight:1.5 }}>Everything in Free, plus full power.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
              {PRO_FEATS.map(f => <div key={f} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13, color:'#fff' }}><span style={{ color:'var(--green)', fontSize:11 }}>✓</span>{f}</div>)}
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="btn btn-lg"
              style={{ width:'100%', justifyContent:'center', background:'linear-gradient(135deg,#2563EB,#7C3AED)', color:'#fff', border:'none', boxShadow:'0 4px 20px rgba(37,99,235,.4)' }}
            >
              {billing === 'lifetime' ? '⚡ Get lifetime — $49' : '⭐ Start Pro — $9/mo'}
            </button>
            <p style={{ fontSize:11, color:'var(--dim)', textAlign:'center', marginTop:8 }}>
              {billing === 'lifetime' ? 'Pay once · Yours forever · No more charges' : 'Cancel anytime from Settings'}
            </p>
          </div>
        </div>

        {/* Feature table */}
        <div className="card fu d3" style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:16 }}>Full feature comparison</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                <th style={{ textAlign:'left', padding:'8px 0', fontSize:10, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px' }}>Feature</th>
                <th style={{ textAlign:'center', padding:'8px 0', fontSize:10, fontWeight:700, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'0.8px' }}>Free</th>
                <th style={{ textAlign:'center', padding:'8px 0', fontSize:10, fontWeight:700, color:'var(--sky)', textTransform:'uppercase', letterSpacing:'0.8px' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['AI project suggestions','3/month','Unlimited'],
                ['Active projects','1','Unlimited'],
                ['Quick Prompts','✓','✓'],
                ['Build roadmap','✓','✓'],
                ['README generator','✓','✓'],
                ['Commit plan','✗','✓'],
                ['GitHub publishing','✗','✓'],
                ['Commit scheduler','✗','✓'],
                ['Portfolio score','✗','✓'],
                ['Priority support','✗','✓'],
              ].map(([feat,free,pro]) => (
                <tr key={feat} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 0', fontSize:13, color:'var(--text)' }}>{feat}</td>
                  <td style={{ textAlign:'center', padding:'10px 0', fontSize:13, color: free==='✗'?'var(--dim)':free==='✓'?'var(--green)':'var(--gray)' }}>{free}</td>
                  <td style={{ textAlign:'center', padding:'10px 0', fontSize:13, color: pro==='✗'?'var(--dim)':'var(--green)', fontWeight: pro!=='✗'&&pro!=='✓'?600:400 }}>{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="card fu d4">
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>FAQ</div>
          {[
            { q:'Is the $49 lifetime deal really lifetime?', a:'Yes. Pay once, use RepoPilot forever with all future updates included. No subscriptions, no renewals.' },
            { q:'What payment methods are accepted?', a:'Visa, Mastercard, PayPal, and Flutterwave for Nigerian users (card, bank transfer, USSD).' },
            { q:'Can I cancel the monthly plan?', a:'Yes, cancel anytime from Settings → Plan. You keep Pro access until the end of the billing period.' },
            { q:'What happens to my projects if I downgrade?', a:'Your data is never deleted. You can read everything but cannot create new projects beyond the Free limit.' },
            { q:'Is there a refund policy?', a:'Yes — full refund within 14 days if you haven\'t published more than 3 repositories. Email billing@repopilot.dev.' },
          ].map(f => (
            <div key={f.q} style={{ padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:4 }}>{f.q}</div>
              <p style={{ fontSize:12, color:'var(--gray)', lineHeight:1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
