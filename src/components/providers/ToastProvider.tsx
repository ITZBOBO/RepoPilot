'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
interface Toast { id: string; message: string; type: ToastType }
interface ToastCtx { toast: (message: string, type?: ToastType) => void }

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

const ICONS: Record<ToastType, string> = {
  success: '✓', error: '✕', info: 'ℹ', warning: '⚠'
}
const COLORS: Record<ToastType, { border: string; color: string; bg: string }> = {
  success: { border: 'rgba(52,211,153,.35)',  color: '#34D399', bg: 'rgba(52,211,153,.08)'  },
  error:   { border: 'rgba(248,113,113,.35)', color: '#F87171', bg: 'rgba(248,113,113,.08)' },
  info:    { border: 'rgba(96,165,250,.35)',  color: '#60A5FA', bg: 'rgba(96,165,250,.08)'  },
  warning: { border: 'rgba(245,158,11,.35)',  color: '#F59E0B', bg: 'rgba(245,158,11,.08)'  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', gap:8, zIndex:9999, alignItems:'center' }}>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div key={t.id}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 22px', background:'#0F2448', border:`1px solid ${c.border}`, borderRadius:10, boxShadow:'0 8px 30px rgba(0,0,0,.6)', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:c.color, whiteSpace:'nowrap', animation:'fadeUp .25s ease', backdropFilter:'blur(10px)' }}
            >
              <span style={{ fontSize:14, fontWeight:700 }}>{ICONS[t.type]}</span>
              {t.message}
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background:'none', border:'none', color:'rgba(255,255,255,.3)', fontSize:16, cursor:'pointer', marginLeft:4, lineHeight:1 }}>×</button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
