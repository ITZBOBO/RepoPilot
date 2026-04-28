import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const PROTECTED = [
          '/dashboard', '/suggestions', '/quick-prompts', '/projects',
          '/roadmap', '/generator', '/drafts', '/publish', '/portfolio',
          '/settings', '/analytics', '/code-builder', '/deployments',
          '/upgrade', '/onboarding',
        ]
        const isProtected = PROTECTED.some(p => pathname.startsWith(p))
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/cron).*)'],
}
