'use client'

import { cn } from '@/src/lib/utils'
import { motion } from 'framer-motion'

interface FilterChipsProps {
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  layoutId: string
  className?: string
  ariaLabel: string
}

export function FilterChips({
  options,
  value,
  onChange,
  layoutId,
  className,
  ariaLabel,
}: FilterChipsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex gap-2 overflow-x-auto scrollbar-none', className)}
    >
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative min-h-11 shrink-0 rounded-2xl px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
              active ? 'text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-2xl bg-primary glow-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
