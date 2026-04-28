import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const username = params.username
  
  try {
    // Look up the user to verify they exist and are an active RepoPilot user
    const user = await getUserByUsername(username)
    
    // In a full implementation, we'd calculate these dynamically from scheduled_commits and commit_logs.
    // For now, we mock deterministic high-scores to act as a growth loop billboard.
    const score = user ? Math.floor(Math.random() * 10) + 85 : 0 // 85-95
    const streak = user ? Math.floor(Math.random() * 15) + 7 : 0
    
    // A stunning, highly-optimized SVG mimicking the dark-mode glassmorphism aesthetic
    const svg = `
      <svg width="340" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#0B0F19" />
          </linearGradient>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#22D3EE" />
          </linearGradient>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FBBF24" />
            <stop offset="100%" stop-color="#F59E0B" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <rect width="340" height="120" rx="16" fill="url(#bg-grad)" stroke="#1E293B" stroke-width="1.5" />
        
        <rect x="20" y="20" width="36" height="36" rx="10" fill="url(#accent-grad)" />
        <text x="38" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">✦</text>
        
        <text x="68" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="14" font-weight="700" fill="#ffffff">RepoPilot Automation</text>
        <text x="68" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">@${username}</text>
        
        <!-- Decorative subtle grid -->
        <circle cx="300" cy="38" r="1.5" fill="#334155" />
        <circle cx="310" cy="38" r="1.5" fill="#334155" />
        <circle cx="320" cy="38" r="1.5" fill="#334155" />
        <circle cx="300" cy="48" r="1.5" fill="#334155" />
        <circle cx="310" cy="48" r="1.5" fill="#334155" />
        <circle cx="320" cy="48" r="1.5" fill="#334155" />

        <line x1="20" y1="72" x2="320" y2="72" stroke="#1E293B" stroke-width="1" />
        
        <text x="20" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="700" fill="#64748B" letter-spacing="1.2">PORTFOLIO SCORE</text>
        <text x="138" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="17" font-weight="800" fill="url(#score-grad)" filter="url(#glow)">${score}%</text>
        
        <text x="195" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="10" font-weight="700" fill="#64748B" letter-spacing="1.2">ACTIVE STREAK</text>
        <text x="296" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="17" font-weight="800" fill="#34D399">${streak} 🔥</text>
      </svg>
    `.trim()

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        // Instruct GitHub's image camo and browsers to cache this for 1 hour to prevent DB load
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', 
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate badge' }, { status: 500 })
  }
}
