import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import { ToastProvider } from '@/components/providers/ToastProvider'
import FloatingCustomizer from '@/components/ui/FloatingCustomizer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    const githubUsername = (session.user as any).githubUsername
    if (githubUsername) {
      const { data: userRow } = await supabaseAdmin
        .from('users')
        .select('skill_level')
        .eq('github_username', githubUsername)
        .single()
        
      if (!userRow?.skill_level) {
        redirect('/onboarding')
      }
    }
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar />
        <MobileNav />
        <div className="main-content">{children}</div>
        <FloatingCustomizer />
      </div>
    </ToastProvider>
  )
}
