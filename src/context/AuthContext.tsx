'use client'
/**
 * AuthContext — thin wrapper around NextAuth useSession.
 * Keeps the same `useAuth()` API so existing dashboard pages
 * don't need mass refactoring.
 */
import { createContext, useContext, ReactNode } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface AuthUser {
  name:           string
  email:          string
  avatarUrl:      string | null
  githubUsername: string
}

interface AuthCtx {
  user:    AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const loading = status === 'loading'

  const user: AuthUser | null = session?.user
    ? {
        name:           session.user.name ?? '',
        email:          session.user.email ?? '',
        avatarUrl:      session.user.image ?? null,
        githubUsername: (session.user as any).githubUsername ?? '',
      }
    : null

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  return (
    <Ctx.Provider value={{ user, loading, signOut }}>
      {children}
    </Ctx.Provider>
  )
}
