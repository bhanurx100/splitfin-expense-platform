'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
import { SegmentedTabs, type SegmentedOption } from '@/src/shared/components/segmented-tabs'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { SplitGroup, SplitMember } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { memo } from 'react'

const directionMeta: Record<
  SplitMember['direction'],
  {
    label: string
    tone: 'negative' | 'positive' | 'neutral'
    amountClass: string
    chip: string
    glow: 'pink' | 'cyan' | 'purple'
    ring: string
    avatarGradient: string
  }
> = {
  'you-owe': {
    label: 'You owe',
    tone: 'negative',
    amountClass: 'text-negative',
    chip: 'bg-negative/12 text-negative',
    glow: 'pink',
    ring: 'rgba(255,45,120,0.45)',
    avatarGradient: 'linear-gradient(135deg, rgba(255,45,120,0.35), rgba(255,45,120,0.08))',
  },
  'owes-you': {
    label: 'Owes you',
    tone: 'positive',
    amountClass: 'text-positive',
    chip: 'bg-positive/12 text-positive',
    glow: 'cyan',
    ring: 'rgba(22,230,161,0.45)',
    avatarGradient: 'linear-gradient(135deg, rgba(22,230,161,0.32), rgba(22,230,161,0.08))',
  },
  settled: {
    label: 'Settled up',
    tone: 'neutral',
    amountClass: 'text-muted-foreground',
    chip: 'bg-white/8 text-muted-foreground',
    glow: 'purple',
    ring: 'rgba(255,255,255,0.16)',
    avatarGradient: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
  },
}

function DirectionIcon({ direction }: { direction: SplitMember['direction'] }) {
  if (direction === 'you-owe') return <ArrowUpRight className="size-3.5" aria-hidden="true" />
  if (direction === 'owes-you') return <ArrowDownLeft className="size-3.5" aria-hidden="true" />
  return <Check className="size-3.5" aria-hidden="true" />
}

export const MemberList = memo(function MemberList({
  members,
  groups,
}: {
  members: SplitMember[]
  groups: SplitGroup[]
}) {
  const [filter, setFilter] = useState('all')

  const visible = useMemo(
    () => (filter === 'all' ? members : members.filter((m) => m.direction === filter)),
    [filter, members],
  )

  const filterOptions = useMemo<SegmentedOption[]>(
    () => [
      { id: 'all', label: 'All', count: members.length, tone: 'primary' },
      {
        id: 'you-owe',
        label: 'You owe',
        count: members.filter((m) => m.direction === 'you-owe').length,
        tone: 'negative',
      },
      {
        id: 'owes-you',
        label: "You're owed",
        count: members.filter((m) => m.direction === 'owes-you').length,
        tone: 'positive',
      },
      {
        id: 'settled',
        label: 'Settled',
        count: members.filter((m) => m.direction === 'settled').length,
        tone: 'neutral',
      },
    ],
    [members],
  )

  // How many real groups each person appears in — derived, never invented.
  const groupCountFor = useMemo(() => {
    const map: Record<string, number> = {}
    for (const member of members) {
      map[member.id] = groups.filter((g) => g.memberAvatars.includes(member.avatar[0])).length
    }
    return map
  }, [members, groups])

  return (
    <section aria-label="People you split with" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">You&apos;re involved in</h2>

      <SegmentedTabs
        options={filterOptions}
        value={filter}
        onChange={setFilter}
        layoutId="member-filter-tab"
        ariaLabel="Filter people by balance direction"
      />

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {visible.map((member, i) => {
              const meta = directionMeta[member.direction]
              const sharedGroups = groupCountFor[member.id] ?? 0
              return (
                <motion.li
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ ...springs.soft, delay: i * 0.05 }}
                >
                  <GlassCard
                    interactive
                    pressable
                    hoverGlow={meta.glow}
                    className="group relative w-full cursor-pointer overflow-hidden p-4"
                    style={{ borderColor: 'rgba(168,85,247,0.42)', boxShadow: '0 0 16px rgba(168,85,247,0.22)' }}
                    role="button"
                    aria-label={`${member.name} — ${meta.label}`}
                  >
                    {/* Direction-colored edge light */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: meta.ring, boxShadow: `0 0 10px ${meta.ring}` }}
                    />

                    <div className="flex items-center gap-3.5 pl-1.5">
                      {/* Premium avatar — gradient glass with status glow */}
                      <motion.span
                        whileHover={{ scale: 1.1, rotate: -3 }}
                        transition={springs.bouncy}
                        className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-foreground"
                        style={{
                          background: meta.avatarGradient,
                          boxShadow: `0 0 0 1px ${meta.ring}, 0 6px 16px rgba(0,0,0,0.35), 0 0 16px ${meta.ring}30`,
                        }}
                      >
                        {/* Glass top light */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-2xl"
                          style={{
                            background:
                              'linear-gradient(180deg, rgba(255,255,255,0.18), transparent 55%)',
                          }}
                        />
                        <span className="relative">{member.avatar}</span>
                      </motion.span>

                      {/* Person + status */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{member.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={cn(
                              'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                              meta.chip,
                            )}
                          >
                            <DirectionIcon direction={member.direction} />
                            {meta.label}
                          </span>
                          {sharedGroups > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {sharedGroups} {sharedGroups === 1 ? 'group' : 'groups'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount — the strongest element */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <AnimatedAmount
                          value={member.netBalance}
                          className={cn('text-lg font-extrabold tabular-nums', meta.amountClass)}
                        />
                        <motion.span
                          className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
                          variants={{ rest: { x: 0 }, hover: { x: 3 } }}
                        >
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </motion.span>
                      </div>
                    </div>
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
})
