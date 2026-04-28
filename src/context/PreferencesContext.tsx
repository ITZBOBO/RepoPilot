'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type WallpaperOption = 'default' | 'mesh' | 'grid' | 'dots' | 'noise' | 'aurora' | 'tokyo' | 'circuit' | 'none'
export type AccentColor    = 'blue' | 'purple' | 'green' | 'amber' | 'pink' | 'cyan'

interface Preferences {
  wallpaper: WallpaperOption
  accent: AccentColor
  sidebarCompact: boolean
  reducedMotion: boolean
}

interface PrefCtx extends Preferences {
  setWallpaper: (w: WallpaperOption) => void
  setAccent: (a: AccentColor) => void
  setSidebarCompact: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
}

const DEFAULTS: Preferences = {
  wallpaper: 'default',
  accent: 'blue',
  sidebarCompact: false,
  reducedMotion: false,
}

const Ctx = createContext<PrefCtx>({ ...DEFAULTS, setWallpaper:()=>{}, setAccent:()=>{}, setSidebarCompact:()=>{}, setReducedMotion:()=>{} })
export const usePreferences = () => useContext(Ctx)

const ACCENT_VARS: Record<AccentColor, string> = {
  blue:   '#2563EB',
  purple: '#7C3AED',
  green:  '#059669',
  amber:  '#D97706',
  pink:   '#DB2777',
  cyan:   '#0891B2',
}

const WALLPAPER_CSS: Record<WallpaperOption, string> = {
  default: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='rgba(255,255,255,0.4)'/%3E%3Ccircle cx='40' cy='60' r='0.5' fill='rgba(255,255,255,0.2)'/%3E%3Ccircle cx='80' cy='30' r='1.5' fill='rgba(255,255,255,0.3)'/%3E%3Ccircle cx='90' cy='80' r='0.8' fill='rgba(255,255,255,0.5)'/%3E%3C/svg%3E"), radial-gradient(ellipse 80% 50% at 50% -20%, rgba(67, 56, 202, 0.4) 0%, transparent 100%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(34, 211, 238, 0.15) 0%, transparent 100%), radial-gradient(ellipse 70% 60% at 10% 50%, rgba(167, 139, 250, 0.15) 0%, transparent 100%)`,
  mesh:    'radial-gradient(at 40% 20%, rgba(37,99,235,.15) 0, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,.12) 0, transparent 50%), radial-gradient(at 0% 50%, rgba(16,185,129,.08) 0, transparent 50%), radial-gradient(at 80% 50%, rgba(245,158,11,.07) 0, transparent 50%), radial-gradient(at 0% 100%, rgba(96,165,250,.08) 0, transparent 50%)',
  grid:    'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
  dots:    'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
  noise:   'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.035\'/%3E%3C/svg%3E")',
  aurora:  'linear-gradient(135deg, rgba(6,182,212,.08) 0%, rgba(37,99,235,.1) 30%, rgba(124,58,237,.1) 60%, rgba(16,185,129,.07) 100%)',
  tokyo:   'linear-gradient(180deg, rgba(247,89,171,.07) 0%, rgba(37,99,235,.07) 40%, rgba(6,182,212,.07) 100%)',
  circuit: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'rgba(96,165,250,0.04)\' stroke-width=\'1\'%3E%3Cpath d=\'M10 10h10v10H10zM40 10h10v10H40zM10 40h10v10H10zM40 40h10v10H40zM20 15h20M15 20v20M45 20v20M20 45h20\'/%3E%3C/g%3E%3C/svg%3E")',
  none:    'none',
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rp_preferences')
      if (saved) setPrefs({ ...DEFAULTS, ...JSON.parse(saved) })
    } catch {}
  }, [])

  // Apply CSS vars when prefs change
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--blue', ACCENT_VARS[prefs.accent])
    const bgSize = prefs.wallpaper === 'grid' ? '40px 40px' : prefs.wallpaper === 'dots' ? '20px 20px' : prefs.wallpaper === 'circuit' ? '60px 60px' : 'auto'
    document.body.style.backgroundImage = WALLPAPER_CSS[prefs.wallpaper] ?? 'none'
    document.body.style.backgroundSize  = bgSize
  }, [prefs])

  const save = (update: Partial<Preferences>) => {
    const next = { ...prefs, ...update }
    setPrefs(next)
    try { localStorage.setItem('rp_preferences', JSON.stringify(next)) } catch {}
  }

  return (
    <Ctx.Provider value={{
      ...prefs,
      setWallpaper: w => save({ wallpaper: w }),
      setAccent:    a => save({ accent: a }),
      setSidebarCompact: v => save({ sidebarCompact: v }),
      setReducedMotion:  v => save({ reducedMotion: v }),
    }}>
      {children}
    </Ctx.Provider>
  )
}
