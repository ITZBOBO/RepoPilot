import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getOrCreateUser } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: 'read:user user:email repo' } },
    }),
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        name: 'Developer Login',
        credentials: {
          username: { label: "Username", type: "text", placeholder: "test" },
          password: {  label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (credentials?.username === 'test' && credentials?.password === 'test') {
            return { id: "1", name: "Test User", email: "test@example.com", image: "https://github.com/test.png" }
          }
          return null
        }
      })
    ] : [])
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'credentials') {
        return true
      }
      if (account?.provider !== 'github') return false
      try {
        const { user: dbUser, isNew } = await getOrCreateUser({
          githubUsername: profile?.login ?? user.name ?? '',
          email:          user.email ?? null,
          avatarUrl:      user.image ?? null,
          githubToken:    account.access_token ?? '',
        })

        // Send welcome email only on first sign-in
        if (isNew && dbUser.email) {
          sendWelcomeEmail(dbUser.email, profile?.login ?? user.name ?? '').catch(
            err => console.error('Welcome email failed:', err)
          )
        }

        return true
      } catch (err) {
        console.error('RepoPilot signIn DB error:', err)
        return false
      }
    },

    async jwt({ token, account, profile }: any) {
      if (account?.provider === 'credentials') {
        token.accessToken    = 'dummy-token'
        token.githubUsername = 'testuser'
      } else if (account) {
        token.accessToken    = account.access_token
        token.githubUsername = profile?.login ?? ''
      }
      return token
    },

    async session({ session, token }: any) {
      session.accessToken         = token.accessToken
      session.user.githubUsername = token.githubUsername
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
