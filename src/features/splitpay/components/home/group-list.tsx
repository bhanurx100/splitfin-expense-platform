'use client'

import { AvatarStack } from '@/src/shared/components/avatar-stack'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import type { SplitGroup } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const statusMeta: Record<
  SplitGroup['status'],
  { label: string; chip: string; amountClass: string; hoverGlow: 'pink' | 'cyan' | 'purple' }
> = {
  'you-owe': { label: 'You owe', chip: 'bg-negative/15 text-negative', amountClass: 'text-negative', hoverGlow: 'pink' },
  'you-are-owed': { label: "You're owed", chip: 'bg-positive/15 text-positive', amountClass: 'text-positive', hoverGlow: 'cyan' },
  settled: { label: 'Settled', chip: 'bg-muted text-muted-foreground', amountClass: 'text-primary', hoverGlow: 'purple' },
}

export function GroupList({ groups }: { groups: SplitGroup[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (groups.length === 0) {
    return (
      <section aria-label="Active groups" className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Active Groups</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.soft}
          className="glass flex flex-col items-center gap-2 rounded-2xl p-8 text-center"
        >
          <p className="text-sm font-semibold">No groups yet</p>
          <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Create your first split and it will show up here.
          </p>
        </motion.div>
      </section>
    )
  }

  return (
    <section aria-label="Active groups" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Active Groups</h2>
        <button
          type="button"
          className="flex min-h-11 items-center gap-1 rounded-lg text-sm font-medium text-primary transition-colors hover:text-primary-bright focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {groups.map((group, i) => {
          const meta = statusMeta[group.status]
          const progress = (group.membersSettled / group.membersTotal) * 100
          const expanded = expandedId === group.id
          const perMember = group.membersTotal > 0 ? group.totalAmount / group.membersTotal : 0
          return (
            <motion.li
              key={group.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.05 }}
            >
              <GlassCard
                interactive
                hoverGlow={meta.hoverGlow}
                className="flex cursor-pointer items-center gap-3.5 p-4"
                onClick={() => setExpandedId((cur) => (cur === group.id ? null : group.id))}
                role="button"
                aria-expanded={expanded}
                aria-label={`${group.name} — ${meta.label} ${formatCurrency(group.amount, group.currency)}. Toggle details.`}
              >
                <motion.span
                  whileHover={{ scale: 1.1, rotate: -4 }}
                  transition={springs.bouncy}
                  className="flex size-13 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${group.coverColor} 16%, transparent)`,
                    color: group.coverColor,
                    boxShadow: `0 0 14px color-mix(in oklch, ${group.coverColor} 20%, transparent)`,
                  }}
                >
                  <CategoryIcon name={group.emojiIcon} className="size-6" />
                </motion.span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{group.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {group.status === 'settled'
                      ? 'All settled'
                      : `${group.membersSettled} of ${group.membersTotal} settled`}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <AvatarStack initials={group.memberAvatars} extra={group.extraMembers} />
                    <div
                      className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${group.name} settlement progress`}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: group.coverColor, boxShadow: `0 0 8px ${group.coverColor}` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>
                    {meta.label}
                  </span>
                  <p className={`text-base font-extrabold tabular-nums ${meta.amountClass}`}>
                    {formatCurrency(group.amount, group.currency)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    of {formatCurrency(group.totalAmount, group.currency)}
                  </p>
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={springs.soft}
                    className="text-muted-foreground"
                  >
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </motion.span>
                </div>
              </GlassCard>

              {/* Expandable settlement details */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                      <div className="text-xs">
                        <p className="text-muted-foreground">Split per member</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums">
                          {formatCurrency(Math.round(perMember), group.currency)}
                        </p>
                      </div>
                      <div className="text-xs">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums" style={{ color: group.coverColor }}>
                          {Math.round(progress)}%
                        </p>
                      </div>
                      <div className="text-xs">
                        <p className="text-muted-foreground">Members</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums">
                          {group.membersSettled}/{group.membersTotal} settled
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
