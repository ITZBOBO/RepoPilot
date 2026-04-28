'use client'
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { mockStats, mockSuggestions, mockPastPublished } from '@/data/mock'

const SCORE_DIMENSIONS = [
  { label:'Project variety',    score:55, max:100, color:'#2563EB', colorBg:'rgba(37,99,235,.1)',    icon:'🎨', tip:'Add projects in different domains — not just web apps.' },
  { label:'Commit frequency',   score:40, max:100, color:'#F59E0B', colorBg:'rgba(245,158,11,.1)',  icon:'📅', tip:'Aim for at least 3 commits per week to signal consistency.' },
  { label:'README quality',     score:70, max:100, color:'#34D399', colorBg:'rgba(52,211,153,.1)',  icon:'📄', tip:'Add screenshots, badges, and a clear setup guide.' },
  { label:'Stack breadth',      score:65, max:100, color:'#A78BFA', colorBg:'rgba(167,139,250,.1)', icon:'🏗️', tip:'Show you can work across frontend, backend, and tools.' },
  { label:'Live deployments',   score:30, max:100, color:'#F472B6', colorBg:'rgba(244,114,182,.1)', icon:'🚀', tip:'Deploy projects to Vercel or Netlify — shows shipping mindset.' },
  { label:'Repo documentation', score:50, max:100, color:'#60A5FA', colorBg:'rgba(96,165,250,.1)',  icon:'📚', tip:'Add contributing guides and code comments.' },
]

const totalScore = Math.round(SCORE_DIMENSIONS.reduce((s, d) => s + d.score, 0) / SCORE_DIMENSIONS.length)

function getGrade(n: number) {
  if (n >= 80) return { label:'Excellent', color:'#34D399' }
  if (n >= 65) return { label:'Good',      color:'#60A5FA' }
  if (n >= 50) return { label:'Average',   color:'#F59E0B' }
  return              { label:'Needs work',color:'#F87171' }
}

const grade = getGrade(totalScore)

const TIPS = [
  { priority:'HIGH',   icon:'🚀', title:'Deploy your projects',      desc:'Only 1 of your 3 projects has a live URL. Deploying to Vercel takes 5 minutes and signals a shipping mindset to recruiters.' },
  { priority:'HIGH',   icon:'📅', title:'Commit more consistently',  desc:"Your commit frequency is 40/100. Even 3 small commits a week will dramatically improve your GitHub's visual activity." },
  { priority:'MEDIUM', icon:'🎨', title:'Add project variety',       desc:'All 3 of your current projects are frontend web apps. Add one backend, one API integration, or one CLI tool.' },
  { priority:'MEDIUM', icon:'📦', title:'Improve your READMEs',     desc:'2 of your repos have short READMEs with no screenshots. Add a demo GIF and badges to stand out.' },
  { priority:'LOW',    icon:'🌱', title:'Pin your best repos',       desc:"GitHub lets you pin 6 repos on your profile. Make sure your best work is pinned and visible first." },
]

const PRIORITY_STYLE: Record<string,{bg:string,color:string}> = {
  HIGH:   { bg:'rgba(248,113,113,.08)', color:'#F87171' },
  MEDIUM: { bg:'rgba(245,158,11,.08)', color:'#F59E0B' },
  LOW:    { bg:'rgba(52,211,153,.08)', color:'#34D399' },
}

// Custom easing — must be a named string or BezierDefinition for framer-motion
const PREMIUM_EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

function AnimatedNumber({ value, delay = 0, className, style }: { value: number, delay?: number, className?: string, style?: React.CSSProperties }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    const controls = animate(0 as number, value, {
      duration: 1.2,
      delay,
      ease: 'easeInOut',
      onUpdate(v) {
        node.textContent = Math.round(v).toString()
      }
    })
    return () => controls.stop()
  }, [value, delay])
  return <span ref={nodeRef} className={className} style={style}>0</span>
}

export default function PortfolioPage() {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const finalStrokeDashoffset = circumference * (1 - totalScore / 100)

  return (
    <>
      <div className="topbar">
        <span className="topbar-title"><EmojiIcon emoji="📊" className="inline" /> Portfolio Score</span>
        <div className="topbar-right">
          <Link href="/suggestions" className="btn btn-primary btn-sm">+ Improve score</Link>
        </div>
      </div>

      <div className="page-content">
        {/* Score hero */}
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, marginBottom:32 }}>
          {/* Big score */}
          <motion.div 
            className="card" 
            style={{ textAlign:'center', padding:'36px 24px', position:'relative', overflow:'hidden' }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
          >
            {/* Soft inner glow on hover could be handled via CSS or animated variants, but scale is main request */}
            <div style={{ position:'relative', width:140, height:140, margin:'0 auto 16px' }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
                <motion.circle 
                  cx="70" cy="70" r="60" fill="none" stroke={grade.color} strokeWidth="10"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: finalStrokeDashoffset }}
                  transition={{ duration: 1.2, ease: PREMIUM_EASE }}
                  strokeLinecap="round" 
                />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <AnimatedNumber value={totalScore} style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'#fff' }} />
                <span style={{ fontSize:12, color:'var(--dim)' }}>/ 100</span>
              </div>
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:grade.color, marginBottom:6 }}>{grade.label}</div>
            <p style={{ fontSize:12, color:'var(--gray)', lineHeight:1.6 }}>Based on {SCORE_DIMENSIONS.length} dimensions of your GitHub profile</p>
          </motion.div>

          {/* Dimensions breakdown */}
          <motion.div 
            className="card"
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(99,102,241,0.08)' }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
          >
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, color:'#fff', marginBottom:18 }}>Score breakdown</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {SCORE_DIMENSIONS.map((dim, index) => {
                const g = getGrade(dim.score)
                const staggerDelay = index * 0.15
                
                return (
                  <div key={dim.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:28, height:28, borderRadius:7, background:dim.colorBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}><EmojiIcon emoji={dim.icon} /></span>
                        <span style={{ fontSize:13, color:'var(--text)' }}>{dim.label}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:g.color, fontWeight:600 }}>{g.label}</span>
                        <AnimatedNumber value={dim.score} delay={staggerDelay} style={{ fontSize:13, fontWeight:700, color:'#fff', width:32, textAlign:'right', display:'inline-block' }} />
                      </div>
                    </div>
                    <div className="progress-track" style={{ height:5, overflow:'hidden' }}>
                      <motion.div 
                        className="progress-bar" 
                        style={{ background:dim.color, height:'100%' }} 
                        initial={{ width: '0%' }}
                        animate={{ width: `${dim.score}%` }}
                        transition={{ duration: 1.2, delay: staggerDelay, ease: PREMIUM_EASE }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
          {/* Action tips */}
          <motion.div 
            className="card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
          >
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div className="section-title"><EmojiIcon emoji="🎯" className="inline" /> What to do next</div>
              <span style={{ fontSize:12, color:'var(--dim)' }}>Sorted by impact</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {TIPS.map((tip, i) => {
                const ps = PRIORITY_STYLE[tip.priority]
                return (
                  <div key={i} style={{ display:'flex', gap:14, padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:ps.bg, border:`1px solid ${ps.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}><EmojiIcon emoji={tip.icon} /></div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff' }}>{tip.title}</span>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100, background:ps.bg, color:ps.color, border:`1px solid ${ps.color}33` }}>{tip.priority}</span>
                      </div>
                      <p style={{ fontSize:12, color:'var(--gray)', lineHeight:1.6 }}>{tip.desc}</p>
                    </div>
                    <Link href="/suggestions" style={{ fontSize:11, color:'var(--sky)', alignSelf:'center', flexShrink:0, textDecoration:'none', fontWeight:600 }}>Fix →</Link>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <motion.div 
              className="card"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(99,102,241,0.08)' }}
              transition={{ duration: 0.4, ease: PREMIUM_EASE }}
            >
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:14 }}>Published projects</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {mockPastPublished.map((p, i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, background:'var(--card2)', border:'1px solid var(--border)' }}>
                    <span style={{ fontSize:18 }}><EmojiIcon emoji={p.emoji} /></span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--dim)' }}>{p.stack}</div>
                    </div>
                    <a href="#" style={{ fontSize:11, color:'var(--sky)', textDecoration:'none' }}>↗</a>
                  </div>
                ))}
              </div>
              <Link href="/publish" className="btn btn-primary btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:12 }}>+ Publish new repo</Link>
            </motion.div>

            <motion.div 
              className="card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: PREMIUM_EASE }}
            >
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'#fff', marginBottom:10 }}>Score history</div>
              {[
                { month:'Jan', score:38 }, { month:'Feb', score:45 }, { month:'Mar', score:62 },
              ].map((h, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:11, color:'var(--dim)', width:28 }}>{h.month}</span>
                  <div className="progress-track" style={{ height:4, flex:1, overflow:'hidden' }}>
                    <motion.div 
                      className="progress-bar progress-blue" 
                      initial={{ width: '0%' }}
                      animate={{ width: `${h.score}%` }}
                      transition={{ duration: 1.2, delay: i * 0.15, ease: PREMIUM_EASE }}
                    />
                  </div>
                  <AnimatedNumber value={h.score} delay={i * 0.15} style={{ fontSize:11, fontWeight:700, color:'var(--sky)', width:28, textAlign:'right', display:'inline-block' }} />
                </div>
              ))}
              <p style={{ fontSize:11, color:'var(--green)', marginTop:8 }}>↑ +24 points in 3 months</p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
