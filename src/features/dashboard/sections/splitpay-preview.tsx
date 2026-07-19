'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { AvatarStack } from '@/src/shared/components/avatar-stack'
import { GlassCard } from '@/src/shared/components/glass-card'
import { springs } from '@/src/shared/lib/motion'
import type { SplitMember, SplitPaySummary } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Plus, Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

  const metrics = [
    {
      id: 'receive',
      label: 'You will receive',
      sub: `From ${summary.owedGroups} groups`,
      value: summary.youAreOwed,
      icon: ArrowDownLeft,
      tone: 'text-positive',
      bg: 'bg-positive/15',
    },
    {
      id: 'pay',
      label: 'You need to pay',
      sub: `Across ${summary.oweGroups} groups`,
      value: summary.youOwe,
      icon: ArrowUpRight,
      tone: 'text-negative',
      bg: 'bg-negative/15',
    },
    {
      id: 'net',
      label: 'Net balance',
      sub: summary.netBalance >= 0 ? 'You are ahead' : 'You need to settle up',
      value: summary.netBalance,
      icon: Scale,
      tone: 'text-primary',
      bg: 'bg-primary/15',
      signed: true,
    },
  ]

  return (
    <GlassCard
      strong
      interactive
      hoverGlow="purple"
      className="relative flex flex-col gap-4 overflow-hidden p-5"
      onClick={open}
      role="link"
      aria-label="SplitPay overview — open SplitPay"
    >
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 90% 0%, oklch(0.45 0.18 285 / 22%), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">SplitPay</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pending.length > 0
              ? `${pending.length} pending settlement${pending.length === 1 ? '' : 's'}`
              : 'All settled up'}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={springs.snappy}
          className="flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground glow-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          New Split
        </motion.button>
      </div>

      <div className="relative flex flex-col gap-3">
        {/* Connecting line */}
        <motion.span
          className="absolute top-4 bottom-4 left-[17px] w-px bg-gradient-to-b from-positive/40 via-negative/40 to-primary/40"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
          aria-hidden="true"
        />
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.id} className="relative flex items-center gap-3">
              <span className={`z-10 flex size-9 items-center justify-center rounded-xl ${m.bg} ${m.tone} node-pulse`}>
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </div>
              <AnimatedAmount
                value={m.value}
                currency={summary.currency}
                signed={m.signed}
                className={`text-base font-bold ${m.tone}`}
              />
            </div>
          )
        })}
      </div>

      {/* Friends strip */}
      {pending.length > 0 && (
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <AvatarStack initials={pending.slice(0, 4).map((m) => m.avatar)} extra={Math.max(pending.length - 4, 0)} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {pending[0].name}
                {pending.length > 1 ? ` +${pending.length - 1}` : ''}
              </p>
              <p className="text-[10px] text-muted-foreground">waiting to settle</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            Settle
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      )}
    </GlassCard>
  )
}
