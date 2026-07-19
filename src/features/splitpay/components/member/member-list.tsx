'use client'

import { FilterChips } from '@/src/shared/components/filter-chips'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { SplitMember } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'you-owe', label: 'You owe' },
  { id: 'owes-you', label: "You're owed" },
  { id: 'settled', label: 'Settled' },
]

const directionMeta: Record<
  SplitMember['direction'],
  { label: string; chip: string; amountClass: string; ring: string }
> = {
  'you-owe': {
    label: 'You owe',
    chip: 'bg-negative/15 text-negative',
    amountClass: 'text-negative',
    ring: 'rgba(255,45,120,0.4)',
  },
  'owes-you': {
    label: 'Owes you',
    chip: 'bg-positive/15 text-positive',
    amountClass: 'text-positive',
    ring: 'rgba(22,230,161,0.4)',
  },
  settled: {
    label: 'Settled up',
    chip: 'bg-muted text-muted-foreground',
    amountClass: 'text-muted-foreground',
    ring: 'rgba(255,255,255,0.14)',
  },
}

const avatarPalette = ['bg-primary/30', 'bg-info/30', 'bg-positive/30', 'bg-warning/30']

export function MemberList({ members }: { members: SplitMember[] }) {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () => (filter === 'all' ? members : members.filter((m) => m.direction === filter)),
    [filter, members],
  )

  const counts = useMemo(() => {
    const opts = filterOptions.map((o) => ({
      ...o,
      count: o.id === 'all' ? members.length : members.filter((m) => m.direction === o.id).length,
    }))
    return opts
  }, [members])

  return (
    <section aria-label="People you split with" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">You&apos;re involved in</h2>
      <FilterChips
        options={counts}
        value={filter}
        onChange={setFilter}
        layoutId="member-filter-chip"
        ariaLabel="Filter people by balance direction"
      />
      {visible.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {visible.map((member, i) => {
              const meta = directionMeta[member.direction]
              return (
                <motion.li
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ ...springs.soft, delay: i * 0.04 }}
                >
                  <GlassCard
                    interactive
                    hoverGlow={member.direction === 'you-owe' ? 'pink' : member.direction === 'owes-you' ? 'cyan' : 'purple'}
                    className="group flex w-full cursor-pointer items-center gap-3.5 p-3.5"
                    role="button"
                    aria-label={`${member.name} — ${meta.label} ${formatCurrency(member.netBalance)}`}
                  >
                    {/* Avatar with status-colored glow ring */}
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      transition={springs.bouncy}
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-foreground',
                        avatarPalette[i % avatarPalette.length],
                      )}
                      style={{ boxShadow: `0 0 0 1.5px ${meta.ring}, 0 0 14px ${meta.ring}` }}
                    >
                      {member.avatar}
                    </motion.span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{member.name}</p>
                      <span className={cn('mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold', meta.chip)}>
                        {meta.label}
                      </span>
                    </div>
                    <p className={cn('shrink-0 text-base font-extrabold tabular-nums', meta.amountClass)}>
                      {formatCurrency(member.netBalance)}
                    </p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </GlassCard>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.soft}
          className="glass rounded-2xl p-6 text-center"
        >
          <p className="text-sm font-medium">All settled up</p>
          <p className="mt-1 text-xs text-muted-foreground">Nobody here — every balance is clear.</p>
        </motion.div>
      )}
    </section>
  )
}
