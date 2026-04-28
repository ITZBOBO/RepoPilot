import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username') || 'developer'
  const score    = searchParams.get('score')    || '??'
  const lang     = searchParams.get('lang')     || 'JavaScript'
  const days     = searchParams.get('days')     || '0'

  const scoreNum = parseInt(score, 10)
  const scoreColor =
    scoreNum >= 80 ? '#34D399'   // green
    : scoreNum >= 60 ? '#FBBF24' // amber
    : '#F87171'                  // red

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: 'linear-gradient(135deg, #050A15 0%, #0B1023 50%, #0D1530 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow orbs */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Main card */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>

          {/* Top row: Logo + Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: 800, color: '#fff',
              }}>
                ✦
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>RepoPilot</span>
                <span style={{ fontSize: '14px', color: 'rgba(148,163,184,0.8)', fontWeight: 500 }}>GitHub Profile Analyzer</span>
              </div>
            </div>

            {/* Score badge */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: `rgba(${scoreNum >= 80 ? '52,211,153' : scoreNum >= 60 ? '251,191,36' : '248,113,113'}, 0.1)`,
              border: `2px solid ${scoreColor}`,
              borderRadius: '20px', padding: '16px 32px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor, textTransform: 'uppercase', letterSpacing: '2px' }}>Portfolio Score</span>
              <span style={{ fontSize: '64px', fontWeight: 900, color: scoreColor, lineHeight: '1.1' }}>{score}</span>
              <span style={{ fontSize: '18px', color: scoreColor, fontWeight: 700 }}>/ 100</span>
            </div>
          </div>

          {/* Middle: Username + headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', color: 'rgba(148,163,184,0.6)', fontWeight: 600 }}>@</span>
              <span style={{ fontSize: '52px', fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>{username}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '100px', padding: '8px 20px', display: 'flex',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#A5B4FC' }}>Top language: {lang}</span>
              </div>
              <div style={{
                background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
                borderRadius: '100px', padding: '8px 20px', display: 'flex',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#67E8F9' }}>
                  {days === '0' ? 'Active today 🔥' : `${days}d since last commit`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: 'rgba(148,163,184,0.5)', fontWeight: 500 }}>
              repopilot.com/analyze/{username}
            </span>
            <div style={{
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              borderRadius: '12px', padding: '14px 28px', display: 'flex',
            }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Get Your Score ✦</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  )
}
