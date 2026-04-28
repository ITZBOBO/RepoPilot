'use client'
import { Suspense } from 'react'
import { NavigationProgress } from '@/components/ui/NavigationProgress'

export function NavigationProgressWrapper() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  )
}
