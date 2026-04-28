import { NextRequest, NextResponse } from 'next/server'

// In production, replace this with a real DB/auth provider lookup.
// This file exists to set the session cookie server-side with proper security flags.
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    // ⚠️  TODO: Replace with real DB credential check before going to production.
    // e.g. const user = await db.users.findByEmail(email)
    //      if (!user || !await bcrypt.compare(password, user.passwordHash)) { ... }

    // Generate a simple random session token (use a real JWT or DB token in production)
    const sessionToken = crypto.randomUUID()

    const response = NextResponse.json({ success: true })

    // Set HttpOnly, Secure, SameSite=Lax cookie server-side
    response.cookies.set('repopilot_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
