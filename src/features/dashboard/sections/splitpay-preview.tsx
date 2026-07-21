'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { AvatarStack } from '@/src/shared/components/avatar-stack'
import { GlassCard } from '@/src/shared/components/glass-card'
import type { SplitMember, SplitPaySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * SplitPay preview — a living window into the SplitPay page, not a KPI
 * widget. Net position is the hero; owe / owed are its two sides; the
 * latest settlement activity anchors the bottom. The entire card is the
 * call to action.
 */
export function SplitPayPreview({
  summary,
  members,
}: {
  summary: SplitPaySummary
  members: SplitMember[]
}) {
  const router = useRouter()
  const open = () => router.push('/splitpay')

  const pending = members.filter((m) => m.direction !== 'settled')
  const ahead = summary.netBalance > 0
  const settled = summary.netBalance === 0
  const netTone = settled ? 'text-primary' : ahead ? 'text-positive' : 'text-negative'
  const netSub = settled ? 'All settled up' : ahead ? "You're ahead overall" : 'You need to settle up'

  // Latest activity = most recently active pending settlement.
  const latest = pending[0]

  return (
    <GlassCard
      strong
      interactive
      className="group relative flex flex-col gap-4 overflow-hidden p-5"
      onClick={open}
      role="link"
      aria-label="SplitPay overview — open SplitPay"
      style={{ borderColor: 'var(--border)', boxShadow: '0 0 20px rgba(0,0,0,0.08)' }}
    >

      {/* Header — title + live pending state */}
      <div className="relative flex items-center justify-between">
        <h2 className="text-lg font-bold">SplitPay</h2>
        <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-transparent px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          <span className="relative flex size-1.5" aria-hidden="true">
            {pending.length > 0 && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-60" />
            )}
            <span
              className={`relative inline-flex size-1.5 rounded-full ${pending.length > 0 ? 'bg-warning' : 'bg-positive'}`}
            />
          </span>
          {pending.length > 0
            ? `${pending.length} pending settlement${pending.length === 1 ? '' : 's'}`
            : 'All settled'}
        </span>
      </div>

      {/* Net position — the hero number */}
      <div className="relative flex flex-col items-center gap-0.5 py-1 text-center">
        <span className="text-[9px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Net Position
        </span>
        <AnimatedAmount
          value={summary.netBalance}
          currency={summary.currency}
          signed
          className={`text-3xl font-extrabold tracking-tight ${netTone}`}
        />
        <span className="text-[11px] text-muted-foreground">{netSub}</span>
      </div>

      {/* The two sides of the balance */}
      <div className="relative grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2.5 rounded-2xl border border-negative/20 bg-transparent px-3 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-negative/30 text-negative">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              You owe
            </p>
            <AnimatedAmount
              value={summary.youOwe}
              currency={summary.currency}
              className="block text-sm font-extrabold leading-tight text-negative"
            />
            <p className="text-[9px] text-muted-foreground">Across {summary.oweGroups} groups</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-positive/20 bg-transparent px-3 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-positive/30 text-positive">
            <ArrowDownLeft className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              You&apos;re owed
            </p>
            <AnimatedAmount
              value={summary.youAreOwed}
              currency={summary.currency}
              className="block text-sm font-extrabold leading-tight text-positive"
            />
            <p className="text-[9px] text-muted-foreground">From {summary.owedGroups} groups</p>
          </div>
        </div>
      </div>

      {/* Latest settlement activity */}
      {latest && (
        <div className="relative flex items-center justify-between gap-3 border-t border-white/6 pt-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <AvatarStack
              initials={pending.slice(0, 4).map((m) => m.avatar)}
              extra={Math.max(pending.length - 4, 0)}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {latest.name}
                {pending.length > 1 ? ` +${pending.length - 1}` : ''}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {latest.direction === 'you-owe' ? 'you owe' : 'owes you'} · active{' '}
                {latest.lastActive ?? 'recently'}
              </p>
            </div>
          </div>
          <motion.span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-transparent text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
            whileHover={{ x: 3 }}
            aria-hidden="true"
          >
            <ArrowRight className="size-4" />
          </motion.span>
        </div>
      )}
    </GlassCard>
  )
}
