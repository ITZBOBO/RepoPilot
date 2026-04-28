import { NextRequest, NextResponse } from 'next/server'
import { getAllActiveSchedulers } from '@/lib/db'
import { runScheduler } from '@/lib/runner'

/**
 * /api/cron — runs every hour via Vercel Cron Jobs.
 * Protected by CRON_SECRET Authorization header.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected   = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const now = new Date()
  const currentHour   = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()
  const currentDow    = now.getUTCDay()

  try {
    const schedulers = await getAllActiveSchedulers()
    
    // Filter and prepare tasks
    const tasks = schedulers.map(async (scheduler) => {
      try {
        if (!matchesCron(scheduler.cron_expression, currentHour, currentMinute, currentDow)) {
          return { id: scheduler.id, status: 'skipped' as const }
        }

        const user = (scheduler as any).users
        if (!user?.github_token) {
          return { id: scheduler.id, status: 'skipped' as const }
        }

        await runScheduler(scheduler.id, user.github_token)
        return { id: scheduler.id, status: 'ran' as const }
      } catch (err: any) {
        return { id: scheduler.id, status: 'error' as const, error: err.message }
      }
    })

    // Run all matched schedulers concurrently.
    // This dramatically reduces total execution time and avoids serverless timeouts.
    const settled = await Promise.allSettled(tasks)
    
    const results = settled.map(result => 
      result.status === 'fulfilled' ? result.value : { id: 'unknown', status: 'error' as const, error: 'Unhandled promise rejection' }
    )

    return NextResponse.json({ processed: results.length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function matchesCron(expr: string, hour: number, minute: number, dow: number): boolean {
  try {
    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 5) return false
    const [minPart, hourPart, , , dowPart] = parts
    return matchField(minPart, minute, 0, 59) && matchField(hourPart, hour, 0, 23) && matchDow(dowPart, dow)
  } catch { return false }
}

function matchField(field: string, value: number, min: number, max: number): boolean {
  if (field === '*') return true
  if (field.includes('-')) { const [lo, hi] = field.split('-').map(Number); return value >= lo && value <= hi }
  if (field.includes(',')) return field.split(',').map(Number).includes(value)
  return Number(field) === value
}

function matchDow(field: string, dow: number): boolean {
  if (field === '*') return true
  if (field.includes('-')) { const [lo, hi] = field.split('-').map(Number); return dow >= lo && dow <= hi }
  if (field.includes(',')) return field.split(',').map(Number).includes(dow)
  const n = Number(field)
  return n === dow || (n === 7 && dow === 0)
}
