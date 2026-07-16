'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { DonutChart } from '@/src/shared/components/donut-chart'
import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/lib/utils'
import type { DistributionSegment } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface DistributionCardProps {
  segments: DistributionSegment[]
  totalBalance: number
  changePercent: number
}

export function DistributionCard({ segments, totalBalance, changePercent }: DistributionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <GlassCard strong className="p-5">
      <div className="flex flex-col items-center">
        <DonutChart
          segments={segments.map((s) => ({ id: s.id, percent: s.percent, color: s.color, label: s.label }))}
          size={200}
          strokeWidth={20}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
          label="Balance distribution across account types"
        >
          <span className="text-xs text-muted-foreground">Total Balance</span>
          <AnimatedAmount value={totalBalance} className="mt-1 text-2xl font-extrabold tracking-tight" />
          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-positive">
            <TrendingUp className="size-3" aria-hidden="true" />
            {changePercent}% vs last month
          </span>
        </DonutChart>
      </div>

      <ul className="mt-5 flex flex-col" aria-label="Balance by account type">
        {segments.map((seg) => {
          const active = selectedId === seg.id
          return (
            <li key={seg.id}>
              <motion.button
                type="button"
                onClick={() => setSelectedId(active ? null : seg.id)}
                whileTap={{ scale: 0.98 }}
                aria-pressed={active}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring ${active ? 'glass' : 'hover:bg-glass'
                  }`}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}` }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{seg.label}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {formatCurrency(seg.amount)}
                </span>
                <span className="glass w-12 shrink-0 rounded-lg py-1 text-center text-xs font-semibold text-muted-foreground">
                  {seg.percent}%
                </span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}
