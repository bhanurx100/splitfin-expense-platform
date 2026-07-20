'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { Insight } from '@/src/types/transaction'
import { cn } from '@/src/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

const toneChip: Record<Insight['tone'], string> = {
  positive: 'bg-positive/15 text-positive',
  negative: 'bg-negative/15 text-negative',
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
}

/**
 * Categories-page insight — rendered from the same insight engine that
 * feeds the Overview, so the finding here is always computed from real
 * category movements, never a predefined string.
 */
export function SpendingInsight({ insight }: { insight: Insight }) {
  const body = (
    <GlassCard strong interactive className="flex items-center gap-4 p-4">
      <span
        className={cn(
          'glow-breathe flex size-12 shrink-0 items-center justify-center rounded-2xl',
          toneChip[insight.tone],
        )}
      >
        <CategoryIcon name={insight.icon} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{insight.title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </GlassCard>
  )

  if (!insight.href) return body
  return (
    <Link href={insight.href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-ring">
      {body}
    </Link>
  )
}
