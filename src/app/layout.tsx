import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { PreferencesProvider } from '@/context/PreferencesContext'
import { NavigationProgressWrapper } from '@/components/ui/NavigationProgressWrapper'
import NextAuthProvider from '@/components/providers/NextAuthProvider'

export const metadata: Metadata = {
  title: { default: 'RepoPilot — AI GitHub Assistant', template: '%s | RepoPilot' },
  description: 'Build the portfolio projects that actually get you hired. AI-powered project suggestions, commit automation, and GitHub publishing — all in one place.',
  keywords: ['github', 'portfolio', 'developer', 'ai', 'projects', 'career', 'commit scheduler', 'github automation'],
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://repopilot.com'),
  openGraph: {
    title: 'RepoPilot — AI GitHub Assistant',
    description: 'Build the portfolio projects that actually get you hired. AI suggestions, commit automation, and GitHub publishing.',
    type: 'website',
    url: process.env.NEXTAUTH_URL ?? 'https://repopilot.com',
    images: [{
      url:    '/api/og?username=repopilot&score=95&lang=AI&days=0',
      width:  1200,
      height: 630,
      alt:    'RepoPilot — AI-powered GitHub portfolio builder',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'RepoPilot — AI GitHub Assistant',
    description: 'Build the portfolio projects that actually get you hired.',
    images:      ['/api/og?username=repopilot&score=95&lang=AI&days=0'],
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <AuthProvider>
            <PreferencesProvider>
              <NavigationProgressWrapper />
              {children}
            </PreferencesProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
