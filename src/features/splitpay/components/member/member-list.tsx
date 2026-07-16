'use client'

import { FilterChips } from '@/src/shared/components/filter-chips'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
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

const avatarPalette = ['bg-primary/30', 'bg-info/30', 'bg-positive/30', 'bg-warning/30']

export function MemberList({ members }: { members: SplitMember[] }) {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () => (filter === 'all' ? members : members.filter((m) => m.direction === filter)),
    [filter, members],
  )

  return (
    <section aria-label="People you split with" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">You&apos;re involved in</h2>
      <FilterChips
        options={filterOptions}
        value={filter}
        onChange={setFilter}
        layoutId="member-filter-chip"
        ariaLabel="Filter people by balance direction"
      />
      {visible.length > 0 ? (
        <GlassCard className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {visible.map((member, i) => {
              const owesYou = member.direction === 'owes-you'
              return (
                <motion.button
                  key={member.id}
                  layout
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26, delay: i * 0.03 }}
                  className="flex min-h-16 w-full items-center gap-3.5 p-4 text-left focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-foreground ${avatarPalette[i % avatarPalette.length]}`}
                  >
                    {member.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{member.name}</p>
                    <p
                      className={`mt-0.5 text-xs font-medium ${member.direction === 'settled'
                          ? 'text-muted-foreground'
                          : owesYou
                            ? 'text-positive'
                            : 'text-negative'
                        }`}
                    >
                      {member.direction === 'settled' ? 'Settled up' : owesYou ? 'Owes you' : 'You owe'}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-bold tabular-nums ${owesYou ? 'text-positive' : 'text-negative'
                      }`}
                  >
                    {formatCurrency(member.netBalance)}
                  </p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </motion.button>
              )
            })}
          </AnimatePresence>
        </GlassCard>
      ) : (
        <p className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          Nobody here yet — everyone is settled up.
        </p>
      )}
    </section>
  )
}
