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
  loading: () => <div className="size-full animate-pulse rounded-full bg-primary/8" aria-hidden="true" />,
})

const toneText: Record<NetTone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-primary-bright',
}

const toneGlow: Record<NetTone, string> = {
  positive: 'rgba(22,230,161,0.16)',
  negative: 'rgba(255,45,120,0.16)',
  neutral: 'rgba(124,60,255,0.16)',
}

/** Thin energy connector — one glowing dot continuously travels to the core. */
function FlowConnector({ color, reverse }: { color: string; reverse?: boolean }) {
  return (
    <div
      aria-hidden
      className="relative h-px min-w-4 flex-1 self-center overflow-visible"
      style={{
        background: `linear-gradient(${reverse ? '270deg' : '90deg'}, transparent, ${color}55)`,
      }}
    >
      <motion.span
        className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80` }}
        animate={{ left: reverse ? ['82%', '8%'] : ['8%', '82%'], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/**
 * SplitPay hero — one unified settlement composition. Left panel is
 * what you owe, right panel what you're owed, the holographic core
 * between them carries the net balance tinted by its real sign, and
 * thin energy streams carry the flow into the core. Nothing decorative.
 */
export function SplitBalanceHero({ summary }: { summary: SplitPaySummary }) {
  const tone: NetTone =
    summary.netBalance > 0 ? 'positive' : summary.netBalance < 0 ? 'negative' : 'neutral'

  return (
    <GlassCard strong className="relative overflow-hidden p-0">
      {/* Living ambience — pink light pools on the owe side, green on the
          owed side, and the core's tone glows from below center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 48% 62% at 6% 50%, rgba(255,45,120,0.17), transparent 70%), radial-gradient(ellipse 48% 62% at 94% 50%, rgba(22,230,161,0.15), transparent 70%), radial-gradient(ellipse 42% 46% at 50% 100%, ${toneGlow[tone]}, transparent 72%), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)`,
        }}
      />
      {/* 3D balance core — small, centered, behind the composition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <SplitHeroScene netTone={tone} />
      </motion.div>

      {/* Unified composition — panel → stream → core → stream → panel */}
      <div className="relative flex h-[262px] items-stretch px-4">
        {/* ── You owe ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.15 }}
          className="flex w-[98px] shrink-0 flex-col items-center justify-center gap-1.5 self-center rounded-2xl border border-negative/30 bg-[rgba(23,10,18,0.72)] p-3 text-center backdrop-blur-xl"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-negative/40 bg-negative/12 text-negative">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground">
            YOU OWE
          </span>
          <AnimatedAmount
            value={summary.youOwe}
            currency={summary.currency}
            className="text-lg font-extrabold leading-tight text-negative"
          />
          <span className="text-[9.5px] text-muted-foreground">
            Across {summary.oweGroups} groups
          </span>
        </motion.div>

        <FlowConnector color="#ff2d78" />

        {/* ── Net balance — lives inside the core ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.3 }}
          className="flex w-[104px] shrink-0 flex-col items-center justify-center gap-1 self-center text-center"
        >
          <span className="text-[9px] font-semibold tracking-[0.22em] text-muted-foreground">
            NET BALANCE
          </span>
          <AnimatedAmount
            value={summary.netBalance}
            currency={summary.currency}
            signed
            className={cn('text-[21px] font-extrabold leading-tight', toneText[tone])}
          />
        </motion.div>

        <FlowConnector color="#16e6a1" reverse />

        {/* ── You're owed ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.15 }}
          className="flex w-[98px] shrink-0 flex-col items-center justify-center gap-1.5 self-center rounded-2xl border border-positive/30 bg-[rgba(8,20,16,0.72)] p-3 text-center backdrop-blur-xl"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-positive/40 bg-positive/12 text-positive">
            <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          </span>
          <span className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground">
            YOU&apos;RE OWED
          </span>
          <AnimatedAmount
            value={summary.youAreOwed}
            currency={summary.currency}
            className="text-lg font-extrabold leading-tight text-positive"
          />
          <span className="text-[9.5px] text-muted-foreground">
            From {summary.owedGroups} groups
          </span>
        </motion.div>
      </div>
    </GlassCard>
  )
}
