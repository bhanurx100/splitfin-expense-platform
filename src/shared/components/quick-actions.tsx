'use client'

import { cn } from '@/src/lib/utils'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface QuickAction {
  id: string
  icon: LucideIcon
  label: string
  hint?: string
  tone?: 'primary' | 'positive' | 'info' | 'warning'
}

const toneClass: Record<string, string> = {
  primary: 'text-primary bg-primary/15',
  positive: 'text-positive bg-positive/15',
  info: 'text-info bg-info/15',
  warning: 'text-warning bg-warning/15',
}

export function QuickActions({ actions, className }: { actions: QuickAction[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="glass flex min-h-11 flex-col items-center gap-2 rounded-xl px-2 py-3 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-2xl',
                toneClass[action.tone ?? 'primary'],
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground">{action.label}</span>
            {action.hint && (
              <span className="text-[9px] leading-tight text-muted-foreground">{action.hint}</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
