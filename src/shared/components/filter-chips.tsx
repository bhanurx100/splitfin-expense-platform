'use client'

import { cn } from '@/src/lib/utils'
import { crossfade, springs } from '@/src/shared/lib/motion'
import { AnimatePresence, motion } from 'framer-motion'

interface FilterChipOption {
  id: string
  label: string
  count?: number
}

interface FilterChipsProps {
  options: FilterChipOption[]
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
          <motion.button
            key={opt.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            whileTap={{ scale: 0.94 }}
            transition={springs.snappy}
            className={cn(
              'relative min-h-11 shrink-0 rounded-2xl px-4 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ring',
              active ? 'text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-2xl bg-primary glow-primary"
                transition={springs.pill}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opt.label}
              {opt.count != null && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={opt.count}
                    {...crossfade}
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none',
                      active ? 'bg-white/20 text-primary-foreground' : 'bg-white/8 text-muted-foreground',
                    )}
                  >
                    {opt.count}
                  </motion.span>
                </AnimatePresence>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
