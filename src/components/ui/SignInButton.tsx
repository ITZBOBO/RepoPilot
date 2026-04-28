'use client'

import { signIn } from 'next-auth/react'
import { EmojiIcon } from '@/components/ui/EmojiIcon'

interface SignInButtonProps {
  className?: string
  style?: React.CSSProperties
  icon?: string
  text?: string
}

export default function SignInButton({ className, style, icon, text = 'Get started free →' }: SignInButtonProps) {
  return (
    <button 
      onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg,#6366F1,#22D3EE)',
        color: '#fff', border: 'none', cursor: 'pointer',
        ...style
      }}
    >
      {icon && <EmojiIcon emoji={icon} className="inline" />}
      {text}
    </button>
  )
}
