'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { Insight } from '@/src/types/transaction'
import { cn } from '@/src/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

const toneClass: Record<Insight['tone'], string> = {
  positive: 'text-positive bg-positive/15',
  negative: 'text-negative bg-negative/15',
  info: 'text-info bg-info/15',
  warning: 'text-warning bg-warning/15',
}

export function InsightCard({ insight }: { insight: Insight }) {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div exit={{ opacity: 0, height: 0, marginTop: -16 }} transition={{ duration: 0.3 }}>
          <GlassCard strong className="relative flex items-start gap-4 p-5">
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-2xl',
                toneClass[insight.tone],
              )}
            >
              <CategoryIcon name={insight.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold">{insight.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
              {insight.cta && (
                <button
                  type="button"
                  className="mt-2 flex min-h-9 items-center gap-1 rounded-lg text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {insight.cta}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss insight"
              onClick={() => setDismissed(true)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" />
            </button>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
