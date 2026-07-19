'use client'

import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { CashFlowPoint } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const periods = ['1M', '3M', '6M', '1Y'] as const

/** How many trailing points each period reveals of the shared series. */
const periodWindow: Record<(typeof periods)[number], number> = {
  '1M': 10,
  '3M': 16,
  '6M': 22,
  '1Y': Number.POSITIVE_INFINITY,
}

export function CashFlowCard({ data }: { data: CashFlowPoint[] }) {
  const [period, setPeriod] = useState<(typeof periods)[number]>('1M')
  const router = useRouter()

  // Income grows above the baseline, expense below it — true flow direction.
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        label: d.label,
        inflow: d.inflow,
        outflow: -Math.abs(d.outflow),
        outflowAbs: Math.abs(d.outflow),
      })),
    [data],
  )

  if (data.length === 0) {
    return (
      <GlassCard strong className="flex flex-col gap-2 p-5">
        <h2 className="text-lg font-bold">Cash Flow</h2>
        <p className="py-6 text-center text-xs text-muted-foreground">
          Cash flow appears once you have transactions.
        </p>
      </GlassCard>
    )
  }

  const visible = useMemo(() => {
    const w = periodWindow[period]
    return Number.isFinite(w) ? chartData.slice(-w) : chartData
  }, [chartData, period])

  const maxAbs = useMemo(
    () => Math.max(...visible.map((d) => Math.max(d.inflow, d.outflowAbs)), 1),
    [visible],
  )

  return (
    <GlassCard strong className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-bold">Cash Flow</h2>
          <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div role="tablist" aria-label="Cash flow period" className="glass flex rounded-xl p-0.5">
          {periods.map((p) => {
            const active = period === p
            return (
              <button
                key={p}
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(p)}
                className={cn(
                  'relative min-h-8 rounded-lg px-2.5 text-xs font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ring',
                  active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cashflow-period-pill"
                    className="absolute inset-0 rounded-lg bg-primary glow-primary"
                    transition={springs.pill}
                  />
                )}
                <span className="relative">{p}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-info" aria-hidden /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-negative" aria-hidden /> Expense
        </span>
        <span className="ml-auto">Tap a bar to explore</span>
      </div>

      <div
        className="h-44 cursor-pointer"
        onClick={() => router.push('/transactions')}
        role="link"
        aria-label="Cash flow — open transactions"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visible}
            barGap={2}
            stackOffset="sign"
            margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'oklch(0.68 0.02 285)', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={[-maxAbs * 1.15, maxAbs * 1.15]} />
            <ReferenceLine y={0} stroke="oklch(1 0 0 / 14%)" strokeWidth={1} />
            <Tooltip
              cursor={{ fill: 'oklch(1 0 0 / 6%)' }}
              contentStyle={{
                background: 'oklch(0.18 0.035 285)',
                border: '1px solid oklch(1 0 0 / 10%)',
                borderRadius: 16,
                fontSize: 12,
              }}
              labelStyle={{ color: 'oklch(0.85 0.02 285)', fontWeight: 600 }}
              formatter={(value, name) => {
                const v = Math.abs(Number(value))
                return [
                  formatCurrency(v),
                  name === 'inflow' ? 'Income' : 'Expense',
                ]
              }}
            />
            <Bar
              dataKey="inflow"
              radius={[3, 3, 0, 0]}
              maxBarSize={9}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            >
              {visible.map((entry) => (
                <Cell key={`in-${entry.label}`} fill="var(--info)" fillOpacity={0.9} />
              ))}
            </Bar>
            <Bar
              dataKey="outflow"
              radius={[0, 0, 3, 3]}
              maxBarSize={9}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            >
              {visible.map((entry) => (
                <Cell key={`out-${entry.label}`} fill="var(--negative)" fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
