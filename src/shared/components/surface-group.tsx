import { cn } from '@/src/lib/utils'
import type { ReactNode } from 'react'

/** A borderless Level 2.5 surface, always nested inside an outer GlowCard. */
export function SurfaceGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('surface-group', className)}>{children}</div>
}
