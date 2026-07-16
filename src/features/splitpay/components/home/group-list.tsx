'use client'

import { AvatarStack } from '@/src/shared/components/avatar-stack'
import { CategoryIcon } from '@/src/shared/components/category-icon'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { SplitGroup } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const statusMeta: Record<
  SplitGroup['status'],
  { label: string; chip: string; amountClass: string }
> = {
  'you-owe': { label: 'You owe', chip: 'bg-negative/15 text-negative', amountClass: 'text-negative' },
  'you-are-owed': { label: "You're owed", chip: 'bg-positive/15 text-positive', amountClass: 'text-positive' },
  settled: { label: 'Settled', chip: 'bg-muted text-muted-foreground', amountClass: 'text-primary' },
}

export function GroupList({ groups }: { groups: SplitGroup[] }) {
  return (
    <section aria-label="Active groups" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Active Groups</h2>
        <button
          type="button"
          className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {groups.map((group, i) => {
          const meta = statusMeta[group.status]
          const progress = (group.membersSettled / group.membersTotal) * 100
          return (
            <motion.li
              key={group.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.05 }}
            >
              <GlassCard interactive className="flex items-center gap-3.5 p-4">
                <span
                  className="flex size-13 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${group.coverColor} 16%, transparent)`,
                    color: group.coverColor,
                    boxShadow: `0 0 14px color-mix(in oklch, ${group.coverColor} 20%, transparent)`,
                  }}
                >
                  <CategoryIcon name={group.emojiIcon} className="size-6" />
                </span>

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
                        style={{ backgroundColor: group.coverColor }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>
                    {meta.label}
                  </span>
                  <p className={`mt-1.5 text-base font-extrabold tabular-nums ${meta.amountClass}`}>
                    {formatCurrency(group.amount, group.currency)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    of {formatCurrency(group.totalAmount, group.currency)}
                  </p>
                </div>
              </GlassCard>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
