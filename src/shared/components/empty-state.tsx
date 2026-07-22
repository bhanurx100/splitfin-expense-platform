import { cn } from '@/src/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('premium-surface flex flex-col items-center gap-2 rounded-2xl bg-card p-8 text-center', className)}>
      <span className="flex size-11 items-center justify-center rounded-[10px] bg-[var(--surface-subtle)] text-primary"><Icon className="size-[18px]" /></span>
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="max-w-64 text-xs leading-4 text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
