import { cn } from '@/src/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-2xl bg-[var(--surface-subtle)]', className)} />
}
