'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { cn } from '@/src/lib/utils'
import type { SplitPaySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { NetTone } from '@/src/shared/three/split-hero-scene'

const SplitHeroScene = dynamic(() => import('@/src/shared/three/split-hero-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-white/5" aria-hidden="true" />,
})

const toneText: Record<NetTone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-foreground',
}

const toneGlow: Record<NetTone, string> = {
  positive: 'rgba(22,230,161,0.14)',
  negative: 'rgba(255,45,120,0.14)',
  neutral: 'rgba(20,217,255,0.1)',
}

/**
 * SplitPay hero — centered three-column composition with equal spacing.
 * Nothing clips; side panels and net balance read as one connected unit.
 */
export function SplitBalanceHero({ summary }: { summary: SplitPaySummary }) {
  const tone: NetTone =
    summary.netBalance > 0 ? 'positive' : summary.netBalance < 0 ? 'negative' : 'neutral'

  return (
    <GlassCard
      strong
      radius="2xl"
      padding="none"
      className="relative overflow-hidden"
      style={{ borderColor: 'rgba(168,85,247,0.42)', boxShadow: '0 0 16px rgba(168,85,247,0.22)' }}
    >

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0"
      >
        <SplitHeroScene netTone={tone} />
      </motion.div>

      <div className="relative grid grid-cols-3 items-stretch gap-2 px-4 py-6 sm:gap-3 sm:px-5">
        {/* You owe */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.1 }}
          className="flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-negative/25 bg-transparent px-2 py-4 text-center sm:px-3"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-negative/30 text-negative">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground">YOU OWE</span>
          <AnimatedAmount
            value={summary.youOwe}
            currency={summary.currency}
            className="w-full truncate text-base font-extrabold leading-tight text-negative sm:text-lg"
          />
          <span className="text-[9px] leading-tight text-muted-foreground">
            Across {summary.oweGroups} group{summary.oweGroups === 1 ? '' : 's'}
          </span>
        </motion.div>

        {/* Net balance — center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.2 }}
          className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center"
        >
          <span className="text-[9px] font-semibold tracking-[0.18em] text-muted-foreground">NET BALANCE</span>
          <AnimatedAmount
            value={summary.netBalance}
            currency={summary.currency}
            signed
            className={cn('w-full truncate text-[28px] font-bold leading-none', toneText[tone])}
          />
        </motion.div>

        {/* You're owed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.1 }}
          className="flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-positive/25 bg-transparent px-2 py-4 text-center sm:px-3"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-positive/30 text-positive">
            <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-[9px] font-semibold tracking-[0.1em] text-muted-foreground">YOU&apos;RE OWED</span>
          <AnimatedAmount
            value={summary.youAreOwed}
            currency={summary.currency}
            className="w-full truncate text-base font-extrabold leading-tight text-positive sm:text-lg"
          />
          <span className="text-[9px] leading-tight text-muted-foreground">
            From {summary.owedGroups} group{summary.owedGroups === 1 ? '' : 's'}
          </span>
        </motion.div>
      </div>
    </GlassCard>
  )
}
