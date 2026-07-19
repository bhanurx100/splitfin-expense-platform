'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { springs } from '@/src/shared/lib/motion'
import type { SplitPaySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowLeftRight, Wallet } from 'lucide-react'
import dynamic from 'next/dynamic'

const SplitHeroScene = dynamic(() => import('@/src/shared/three/split-hero-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-primary/8" aria-hidden="true" />,
})

/**
 * SplitPay hero — the 3D settlement composition carries the story
 * (friends, flow, settlement); the summary trio sits beneath as three
 * compact, balanced premium cards with animated counters.
 */
export function SplitBalanceHero({ summary }: { summary: SplitPaySummary }) {
  const metrics = [
    {
      id: 'owe',
      label: 'You owe',
      value: summary.youOwe,
      sub: `Across ${summary.oweGroups} groups`,
      icon: ArrowLeftRight,
      tone: 'text-negative',
      bg: 'bg-negative/15',
      glow: 'pink' as const,
      signed: false,
    },
    {
      id: 'net',
      label: 'Net Balance',
      value: summary.netBalance,
      sub: summary.netBalance < 0 ? 'Settle up' : 'You are ahead',
      icon: Wallet,
      tone: 'text-primary',
      bg: 'bg-primary/15',
      glow: 'purple' as const,
      signed: true,
    },
    {
      id: 'owed',
      label: "You're owed",
      value: summary.youAreOwed,
      sub: `From ${summary.owedGroups} groups`,
      icon: ArrowDownLeft,
      tone: 'text-positive',
      bg: 'bg-positive/15',
      glow: 'cyan' as const,
      signed: false,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* ── 3D hero stage ─────────────────────────────────────────── */}
      <GlassCard strong className="relative overflow-hidden p-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 30%, oklch(0.45 0.18 285 / 26%), transparent)',
          }}
          aria-hidden="true"
        />
        <div
          className="glow-breathe pointer-events-none absolute inset-x-10 bottom-4 h-16 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(ellipse, rgba(124,60,255,0.32), transparent 70%)' }}
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-56"
        >
          <SplitHeroScene />
        </motion.div>
        <div className="relative flex flex-col items-center pb-5 text-center">
          <p className="text-sm font-semibold">Shared expenses, settled beautifully</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track splits with friends and settle in one tap
          </p>
        </div>
      </GlassCard>

      {/* ── Summary trio ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.soft, delay: 0.1 + i * 0.07 }}
            >
              <GlassCard interactive hoverGlow={m.glow} className="flex h-full flex-col gap-2 p-3.5">
                <span className={`flex size-8 items-center justify-center rounded-xl ${m.bg} ${m.tone}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                <AnimatedAmount
                  value={m.value}
                  currency={summary.currency}
                  signed={m.signed}
                  className={`text-lg font-extrabold leading-tight ${m.tone}`}
                />
                <span className="mt-auto text-[10px] text-muted-foreground">{m.sub}</span>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
