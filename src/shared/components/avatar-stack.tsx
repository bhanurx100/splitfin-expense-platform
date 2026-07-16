'use client'

import { cn } from '@/src/lib/utils'

interface AvatarStackProps {
  initials: string[]
  extra?: number
  size?: 'sm' | 'md'
  className?: string
}

const palette = ['bg-primary/30', 'bg-info/30', 'bg-positive/30', 'bg-warning/30']

export function AvatarStack({ initials, extra, size = 'sm', className }: AvatarStackProps) {
  const dim = size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs'
  return (
    <div className={cn('flex items-center -space-x-2', className)} aria-label={`${initials.length + (extra ?? 0)} members`}>
      {initials.map((label, i) => (
        <span
          key={`${label}-${i}`}
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-background font-semibold text-foreground',
            dim,
            palette[i % palette.length],
          )}
        >
          {label}
        </span>
      ))}
      {extra != null && extra > 0 && (
        <span
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-background bg-muted font-semibold text-muted-foreground',
            dim,
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}
