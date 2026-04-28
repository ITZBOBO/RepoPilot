import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json()

    // Field presence check
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Password length
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    // Name length guard
    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
    }

    // ⚠️  TODO: Before going to production, replace below with:
    //   1. Check DB for existing user with this email → 409 Conflict
    //   2. Hash password: const hash = await bcrypt.hash(password, 12)
    //   3. Save new user to DB
    //   4. Send verification email

    const sessionToken = crypto.randomUUID()
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()

    const response = NextResponse.json({
      success: true,
      user: { name: `${firstName} ${lastName}`, email, initials },
    })

    response.cookies.set('repopilot_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
