'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const [progress, setProgress]   = useState(0)
  const [visible, setVisible]     = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const raf   = useRef<number | null>(null)

  useEffect(() => {
    // Route changed → finish bar
    setProgress(100)
    const t = setTimeout(() => setVisible(false), 300)
    return () => clearTimeout(t)
  }, [pathname, searchParams])

  // Intercept all link clicks to start bar immediately
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return
      // Start progress
      setVisible(true)
      setProgress(0)
      // Fast start, then slow down
      let p = 0
      const tick = () => {
        p += p < 30 ? 8 : p < 60 ? 4 : p < 80 ? 2 : p < 90 ? 0.5 : 0.1
        if (p < 92) { setProgress(p); raf.current = requestAnimationFrame(tick) }
      }
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(tick)
    }
    document.addEventListener('click', handler)
    return () => { document.removeEventListener('click', handler); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 2.5, zIndex: 9999,
      background: 'transparent', pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--blue), var(--sky))',
        boxShadow: '0 0 8px var(--blue)',
        transition: progress === 100 ? 'width .15s ease, opacity .25s .1s ease' : 'width .08s ease',
        opacity: progress === 100 ? 0 : 1,
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}
