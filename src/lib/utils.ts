// ─── Class name merger ─────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// ─── Date helpers ──────────────────────────────────────
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0)  return `${mins}m ago`
  return 'just now'
}

// ─── String helpers ────────────────────────────────────
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Number helpers ────────────────────────────────────
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

export function pct(n: number, total: number): number {
  if (total === 0) return 0
  return Math.round((n / total) * 100)
}

// ─── Difficulty badge ──────────────────────────────────
export function difficultyBadge(d: string): string {
  const map: Record<string, string> = {
    BEGINNER: 'badge-green', INTERMEDIATE: 'badge-amber', ADVANCED: 'badge-purple'
  }
  return map[d] || 'badge-gray'
}

// ─── Commit type color ─────────────────────────────────
export function commitColor(type: string): string {
  const map: Record<string, string> = {
    feat: '#60A5FA', fix: '#F87171', docs: '#A78BFA',
    style: '#F472B6', refactor: '#34D399', test: '#F59E0B',
    chore: '#94A3B8', init: '#34D399', deploy: '#F59E0B',
  }
  return map[type] || '#475569'
}

// ─── Status label ──────────────────────────────────────
export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    ACTIVE: '🟢 Active', COMPLETE: '✅ Complete', PAUSED: '⏸️ Paused',
    PENDING: '⬜ Pending', DONE: '✅ Done', SCHEDULED: '📅 Scheduled',
    PUSHED: '✅ Pushed', FAILED: '❌ Failed',
  }
  return map[s] || s
}

// ─── Local storage helpers (client only) ──────────────
export function getLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export function setLS<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* quota exceeded */ }
}
