'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const WHO_OPTIONS = [
  { key:'cs-student',    label:'CS Student',     desc:'Still in university, building toward graduation', emoji:'🎓', value:'final-year CS student' },
  { key:'bootcamp',      label:'Bootcamp Grad',  desc:'Finished a coding bootcamp, now job hunting',     emoji:'⚡', value:'bootcamp graduate' },
  { key:'self-taught',   label:'Self-Taught',    desc:'Learning independently through tutorials',        emoji:'📚', value:'self-taught developer' },
  { key:'junior',        label:'Junior Dev',     desc:'Have some experience, looking to level up',       emoji:'💻', value:'junior developer' },
]
const SIT_OPTIONS = [
  { key:'jobs',      label:'Applying for jobs',       desc:'Sending out applications, need a strong GitHub now',       emoji:'💼', color:'var(--green)',  borderClass:'sc-green',  value:'actively applying for developer jobs and need to impress recruiters' },
  { key:'intern',    label:'Hunting internships',     desc:'Targeting internship roles, building first real portfolio', emoji:'🏢', color:'var(--sky)',    borderClass:'sc-blue',   value:'looking for a developer internship and want to build internship-level portfolio projects' },
  { key:'freelance', label:'Getting freelance work',  desc:'Want projects that prove I can build real things',         emoji:'🌍', color:'var(--amber)',  borderClass:'sc-amber',  value:'trying to get freelance clients and need projects that prove I can build real products' },
  { key:'learning',  label:'Focused on learning',     desc:'Not rushing, want to build things that teach me',          emoji:'📈', color:'var(--purple)', borderClass:'sc-purple', value:'focused on learning and want projects that genuinely improve my technical skills' },
  { key:'empty',     label:'GitHub is empty',         desc:'Starting from zero, need my first few solid projects',     emoji:'🌱', color:'var(--pink)',   borderClass:'sc-pink',   value:'starting from scratch — my GitHub is empty and I need my first few projects' },
  { key:'variety',   label:'Need more variety',       desc:'Built mostly one type of project, need to diversify',      emoji:'🎨', color:'var(--sky)',    borderClass:'sc-sky',    value:'my GitHub lacks variety and I need to show a wider range of skills' },
]
const TIME_OPTIONS = [
  { label:'⚡ A few hours today', value:'a few hours today' },
  { label:'📅 This weekend',      value:'this weekend — about 2 days' },
  { label:'🗓️ About 1 week',      value:'about 1 week' },
  { label:'📆 2–3 weeks',         value:'2 to 3 weeks' },
  { label:'🏆 A full month',      value:'a full month or more' },
]
const TEMPLATES = [
  (w:string,s:string,t:string) => `I'm a ${w} who is ${s}. I have ${t}. Give me 5 project ideas matched to my situation, each with a full build strategy, estimated time, and why it fits my specific goal.`,
  (w:string,s:string,t:string) => `As a ${w} who is ${s}, suggest portfolio projects I can realistically complete in ${t}. Focus on projects that directly move me toward my goal and stand out on GitHub.`,
  (w:string,s:string,t:string) => `I'm a ${w}, currently ${s}. My available time is ${t}. What are the most impactful projects to build right now to move my career forward?`,
]
const READY_PROMPTS = [
  { e:'💼', t:'Suggest 6 portfolio projects that will help me land a frontend internship', c:'goal' },
  { e:'🚀', t:'What should I build to stand out as a React developer applying for junior roles?', c:'goal' },
  { e:'🔗', t:'Give me 3 projects that prove I can work with real APIs and live data sources', c:'goal' },
  { e:'🔄', t:'I want to switch from frontend to full-stack — what should I build first?', c:'goal' },
  { e:'⚛️', t:'Best portfolio projects for a React + Tailwind CSS developer right now', c:'stack' },
  { e:'🟢', t:'What can I build with Node.js + Express that will impress recruiters?', c:'stack' },
  { e:'🐍', t:'I know Python and want to add a strong web project to my GitHub', c:'stack' },
  { e:'⚡', t:"What's a quick win project I can build today and push to GitHub tonight?", c:'time' },
  { e:'📅', t:'I have this weekend — what can I fully build and push to GitHub in 2 days?', c:'time' },
  { e:'🗓️', t:'Give me a project I can complete in 1 week that looks impressive on my GitHub', c:'time' },
  { e:'🏆', t:"I have 30 days — what's the most ambitious portfolio project worth attempting?", c:'time' },
  { e:'🌱', t:"I'm a complete beginner — what's my very first GitHub project to build confidence?", c:'career' },
  { e:'📂', t:'I have 3 projects already — what should project #4 be to fill my skill gaps?', c:'career' },
  { e:'🎯', t:"I'm applying for jobs next month — what will make my portfolio stand out fast?", c:'career' },
  { e:'🧩', t:'My GitHub has no variety — how do I fix it in the next 2 weeks?', c:'career' },
  { e:'🤖', t:'Build me a project that uses OpenAI or Gemini to solve a real everyday problem', c:'trending' },
  { e:'🌍', t:'Give me a fintech or logistics project relevant to Nigerian and African markets', c:'trending' },
  { e:'📊', t:'What dashboard project best showcases real data visualisation skills?', c:'trending' },
  { e:'⚽', t:'Suggest a project that combines my passion for football with web development', c:'trending' },
  { e:'💡', t:'Give me a micro-SaaS idea I could build solo and potentially monetise as a student', c:'trending' },
]

export default function QuickPromptsPage() {
  const router = useRouter()
  const [who, setWho] = useState('')
  const [sit, setSit] = useState('')
  const [time, setTime] = useState('')
  const [tmplIdx, setTmplIdx] = useState(0)
  const [tab, setTab] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(-1)
  const [activePrompt, setActivePrompt] = useState('')

  const whoVal = WHO_OPTIONS.find(o => o.key === who)?.value || ''
  const sitVal = SIT_OPTIONS.find(o => o.key === sit)?.value || ''
  const allFilled = who && sit && time

  const builtPrompt = allFilled
    ? TEMPLATES[tmplIdx % TEMPLATES.length](whoVal, sitVal, time)
    : ''

  const displayPrompt = activePrompt || builtPrompt

  const genLabels = ['Reading your profile…','Understanding your goal…','Matching stack and time…','Generating project ideas…','Scoring fit and difficulty…']

  async function runGenerate() {
    if (!displayPrompt) return
    setGenerating(true)
    setGenStep(0)

    // Advance loading steps visually
    let step = 0
    const iv = setInterval(() => {
      step++
      if (step < genLabels.length - 1) setGenStep(step)
    }, 800)

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          who:       whoVal || 'developer',
          situation: sitVal || 'building portfolio projects',
          time:      time   || '1 week',
          stack:     ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
          goal:      sitVal || 'portfolio growth',
        }),
      })
      const data = await res.json()
      if (res.ok && data.suggestions?.length) {
        // Persist to localStorage so suggestions page can use them
        try { localStorage.setItem('rp_ai_suggestions', JSON.stringify(data.suggestions)) } catch {}
      }
    } catch { /* no-op — suggestions page will fall back to mock data */ }
    finally {
      clearInterval(iv)
      setGenStep(genLabels.length - 1)
      setTimeout(() => { setGenerating(false); setGenStep(-1); router.push('/suggestions') }, 700)
    }
  }


  const filtered = tab === 'all' ? READY_PROMPTS : READY_PROMPTS.filter(p => p.c === tab)
  const catLabel: Record<string,string> = { goal:'🎯 Goal', stack:'🏗️ Stack', time:'⏱️ Time', career:'📈 Career', trending:'🔥 Hot' }

  return (
    <>
      {generating && (
        <div className="gen-overlay">
          <div className="gen-card">
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>RepoPilot is working…</div>
            <div style={{ fontSize:13, color:'var(--gray)', marginBottom:28 }}>Turning your answers into perfect suggestions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {genLabels.map((s, idx) => (
                <div key={idx} className={`gen-step ${idx < genStep ? 'done' : idx === genStep ? 'running' : ''}`}>
                  <span className="gen-dot" />{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="⚡" className="inline" /> Quick Prompts</span>
        <div className="topbar-right">
          <div className="status-live"><span className="blink-dot" style={{ width:5,height:5,borderRadius:'50%',background:'var(--green)',display:'inline-block' }} />AI Ready</div>
        </div>
      </div>

      <div className="page-content">

        {/* Intro */}
        <div className="fu d1" style={{ textAlign:'center', padding:'40px 20px 36px', background:'linear-gradient(180deg,rgba(37,99,235,.05) 0%,transparent 100%)', borderRadius:20, border:'1px solid var(--border)', marginBottom:40, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:300, height:300, background:'radial-gradient(circle,rgba(37,99,235,.1),transparent 70%)', pointerEvents:'none' }} />
          <span className="badge badge-blue" style={{ marginBottom:16, position:'relative' }}>✦ No prompt skills needed</span>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'#fff', letterSpacing:-0.5, marginBottom:10, position:'relative' }}>
            Tell us about yourself.<br /><span style={{ color:'var(--sky)' }}>We handle the rest.</span>
          </h1>
          <p style={{ fontSize:14, color:'var(--gray)', fontWeight:300, lineHeight:1.75, maxWidth:440, margin:'0 auto', position:'relative' }}>
            Not sure what to type into an AI? Answer 3 quick questions — RepoPilot builds the perfect prompt for you automatically. Zero experience needed.
          </p>
        </div>

        {/* Step 1 */}
        <div className="fu d2" style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--blue)',color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 0 4px rgba(37,99,235,.2)' }}>1</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>Who are you right now?</div>
            <div style={{ fontSize:12, color:'var(--dim)', marginLeft:'auto' }}>Pick one</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {WHO_OPTIONS.map(o => (
              <div
                key={o.key}
                onClick={() => setWho(o.key)}
                style={{ border:`1.5px solid ${who===o.key ? 'var(--blue)' : 'var(--border)'}`, borderRadius:13, padding:'18px 16px', cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:9, transition:'all .2s', boxShadow: who===o.key ? '0 0 0 3px rgba(37,99,235,.15)' : 'none', background: who===o.key ? 'rgba(37,99,235,.1)' : 'var(--card)' }}
              >
                <span style={{ fontSize:26 }}>{o.emoji}</span>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff' }}>{o.label}</div>
                <div style={{ fontSize:11, color:'var(--dim)', lineHeight:1.4 }}>{o.desc}</div>
                <div style={{ width:18,height:18,borderRadius:'50%',border:`1.5px solid ${who===o.key ? 'var(--blue)' : 'var(--border2)'}`,background: who===o.key ? 'var(--blue)' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',transition:'all .2s' }}>
                  {who===o.key ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div className="fu d3" style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--blue)',color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 0 4px rgba(37,99,235,.2)' }}>2</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>What is your current situation?</div>
            <div style={{ fontSize:12, color:'var(--dim)', marginLeft:'auto' }}>Pick one</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {SIT_OPTIONS.map(o => (
              <div
                key={o.key}
                onClick={() => setSit(o.key)}
                style={{ background:'var(--card)', border:`1.5px solid ${sit===o.key ? o.color : 'var(--border)'}`, borderRadius:13, padding:'16px 18px', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:12, transition:'all .2s', boxShadow: sit===o.key ? `0 0 0 3px ${o.color}22` : 'none' }}
              >
                <span style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{o.emoji}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:3 }}>{o.label}</div>
                  <div style={{ fontSize:11, color:'var(--dim)', lineHeight:1.45 }}>{o.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className="fu d3" style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--blue)',color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 0 4px rgba(37,99,235,.2)' }}>3</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>How much time do you have?</div>
            <div style={{ fontSize:12, color:'var(--dim)', marginLeft:'auto' }}>Pick one</div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {TIME_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setTime(o.value)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:100, background: time===o.value ? 'rgba(245,158,11,.1)' : 'var(--card)', border:`1.5px solid ${time===o.value ? 'rgba(245,158,11,.4)' : 'var(--border)'}`, fontSize:13, fontWeight:500, color: time===o.value ? 'var(--amber)' : 'var(--gray)', transition:'all .18s' }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt preview */}
        <div className="fu d4" style={{ marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--green)',color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 0 4px rgba(52,211,153,.2)' }}>✦</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, color:'#fff' }}>Your prompt — ready to fire</div>
            <div style={{ fontSize:12, color: allFilled ? 'var(--green)' : 'var(--dim)', marginLeft:'auto' }}>
              {allFilled ? '✓ Prompt ready — hit generate' : `${[who,sit,time].filter(Boolean).length}/3 answered`}
            </div>
          </div>
          <div style={{ background:'var(--card)', border:`1px solid ${allFilled ? 'rgba(52,211,153,.3)' : 'var(--border)'}`, borderRadius:16, overflow:'hidden', transition:'border-color .3s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderBottom:'1px solid var(--border)' }}>
              <span className="badge badge-blue">{activePrompt ? '📋 Ready-made prompt' : allFilled ? '✦ Auto-built for you' : 'Auto-generated'}</span>
              {allFilled && (
                <button onClick={() => setTmplIdx(i => i+1)} style={{ background:'none', border:'none', color:'var(--dim)', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                  ↻ Try another version
                </button>
              )}
            </div>
            <div style={{ padding:22 }}>
              <div style={{ fontSize:15, fontWeight:400, color: displayPrompt ? '#fff' : 'var(--dim)', lineHeight:1.65, fontStyle: displayPrompt ? 'normal' : 'italic', minHeight:56 }}>
                {displayPrompt || 'Answer the 3 questions above and your AI prompt will appear here — ready to use with one click. No typing required.'}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, padding:'0 22px 22px', flexWrap:'wrap' }}>
              <button onClick={runGenerate} disabled={!displayPrompt} className="btn btn-primary btn-lg" style={{ opacity: displayPrompt ? 1 : 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Generate my suggestions
              </button>
              {displayPrompt && (
                <button onClick={() => navigator.clipboard?.writeText(displayPrompt)} className="btn btn-ghost btn-md">Copy prompt</button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
          <span style={{ fontSize:11, color:'var(--dim)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>Or pick one below</span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        {/* Browse */}
        <div className="fu d5">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, color:'#fff' }}><EmojiIcon emoji="📋" className="inline" /> Ready-made prompts — click any to use</div>
          </div>
          <div className="tabs" style={{ marginBottom:16 }}>
            {['all','goal','stack','time','career','trending'].map(t => (
              <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                {t==='all'?'All':catLabel[t]}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map((p, i) => (
              <div
                key={i}
                onClick={() => { setActivePrompt(p.t) }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, cursor:'pointer', transition:'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,.14)'; (e.currentTarget as HTMLElement).style.transform='translateX(3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.transform='' }}
              >
                <span style={{ fontSize:18, width:28, textAlign:'center', flexShrink:0 }}>{p.e}</span>
                <div style={{ flex:1, fontSize:13, color:'var(--text)' }}>{p.t}</div>
                <span style={{ fontSize:10, fontWeight:600, color:'var(--dim)', textTransform:'uppercase', letterSpacing:'.7px', flexShrink:0, width:64, textAlign:'right' }}>{catLabel[p.c]}</span>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setActivePrompt(p.t) }} style={{ flexShrink:0 }}>Use →</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
