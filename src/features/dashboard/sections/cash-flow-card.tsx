'use client'

import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { CashFlowPeriod, CashFlowPoint, Currency } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
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

const periods: CashFlowPeriod[] = ['1M', '3M', '6M', '1Y']

const periodCap: Record<CashFlowPeriod, number> = {
  '1M': 5000,
  '3M': 5000,
  '6M': 5000,
  '1Y': 5000,
}

function FlowTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean
  payload?: Array<{ payload?: { inflowRaw?: number; outflowRaw?: number } }>
  label?: string
  currency: Currency
}) {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0]?.payload as { inflowRaw?: number; outflowRaw?: number } | undefined
  const inflow = Math.abs(datum?.inflowRaw ?? 0)
  const outflow = Math.abs(datum?.outflowRaw ?? 0)
  return (
    <div
      className="min-w-36 rounded-2xl border border-white/12 px-3.5 py-2.5 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(black, black)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(20,217,255,0.08)',
      }}
    >
      <p className="text-[11px] font-semibold tracking-wide text-foreground">{label}</p>
      <div className="mt-1.5 flex flex-col gap-1">
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-info" aria-hidden /> Income
          </span>
          <span className="font-bold text-foreground">{formatCurrency(inflow, currency)}</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-negative" aria-hidden /> Expense
          </span>
          <span className="font-bold text-foreground">{formatCurrency(outflow, currency)}</span>
        </p>
      </div>
    </div>
  )
}

export function CashFlowCard({
  seriesByPeriod,
  currency,
}: {
  seriesByPeriod: Record<CashFlowPeriod, CashFlowPoint[]>
  currency: Currency
}) {
  const [period, setPeriod] = useState<CashFlowPeriod>('1M')
  const router = useRouter()

  const cap = periodCap[period]
  const rawSeries = seriesByPeriod[period] ?? []

  const chartData = useMemo(
    () =>
      rawSeries.map((d) => ({
        label: d.label,
        dateKey: d.dateKey,
        inflow: Math.min(d.inflow, cap),
        outflow: -Math.min(Math.abs(d.outflow), cap),
        outflowAbs: Math.min(Math.abs(d.outflow), cap),
        inflowRaw: d.inflow,
        outflowRaw: Math.abs(d.outflow),
      })),
    [rawSeries, cap],
  )

  // Derived directly from the same filtered series driving the chart —
  // no parallel state, no separate fetch/aggregation.
  const { incomeTotal, expenseTotal } = useMemo(
    () =>
      rawSeries.reduce(
        (acc, d) => {
          acc.incomeTotal += d.inflow
          acc.expenseTotal += Math.abs(d.outflow)
          return acc
        },
        { incomeTotal: 0, expenseTotal: 0 },
      ),
    [rawSeries],
  )

  const maxAbs = useMemo(
    () => Math.max(...chartData.map((d) => Math.max(d.inflow, d.outflowAbs)), 1),
    [chartData],
  )

  const tickInterval = chartData.length > 14 ? Math.ceil(chartData.length / 7) - 1 : 'preserveStartEnd'

  const navigateToPoint = useCallback(
    (dateKey?: string) => {
      if (!dateKey) {
        router.push('/transactions')
        return
      }
      if (dateKey.length === 7) {
        router.push(`/transactions?month=${dateKey}`)
        return
      }
      router.push(`/transactions?date=${dateKey}`)
    },
    [router],
  )

  if (chartData.length === 0) {
    return (
      <GlassCard
        strong
        radius="2xl"
        padding="lg"
        className="flex flex-col gap-2"
        style={{ borderColor: 'rgba(59,130,246,0.42)', boxShadow: '0 0 16px rgba(59,130,246,0.22)' }}
      >
        <h2 className="text-lg font-bold">Cash Flow</h2>
        <p className="py-6 text-center text-xs text-muted-foreground">
          Cash flow appears once you have transactions.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard
      strong
      radius="2xl"
      padding="lg"
      className="flex flex-col gap-4"
      style={{ borderColor: 'rgba(59,130,246,0.42)', boxShadow: '0 0 16px rgba(59,130,246,0.22)' }}
    >
      {/* Header: title + timeframe selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
                  'relative min-h-7 rounded-full px-2.5 text-xs font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ring',
                  active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cashflow-period-pill"
                    className="absolute inset-0 rounded-full bg-info glow-primary"
                    transition={springs.pill}
                  />
                )}
                <span className="relative">{p}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Inline Income / Expense metrics — replaces the old Flow Summary section.
          Same period state, same filtered series, so these always match the chart. */}
      <div className="flex items-center gap-5">
        <Link
          href={`/transactions?type=income&period=${period}`}
          className="group flex min-w-0 flex-col gap-0.5 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-info" aria-hidden /> Income
          </span>
          <span className="truncate text-base font-bold leading-tight text-info sm:text-lg">
            {formatCurrency(incomeTotal, currency)}
          </span>
        </Link>

        <Link
          href={`/transactions?type=expense&period=${period}`}
          className="group flex min-w-0 flex-col gap-0.5 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full bg-negative" aria-hidden /> Expense
          </span>
          <span className="truncate text-base font-bold leading-tight text-negative sm:text-lg">
            {formatCurrency(expenseTotal, currency)}
          </span>
        </Link>

        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          Tap a bar to explore
        </span>
      </div>

      <div className="h-44" role="img" aria-label="Cash flow chart — tap a bar to view transactions">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barGap={2}
            stackOffset="sign"
            margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'oklch(0.68 0.02 285)', fontSize: 10 }}
              interval={tickInterval as number | 'preserveStartEnd'}
            />
            <YAxis hide domain={[-maxAbs * 1.15, maxAbs * 1.15]} />
            <ReferenceLine y={0} stroke="oklch(1 0 0 / 14%)" strokeWidth={1} />
            <Tooltip cursor={{ fill: 'oklch(1 0 0 / 6%)' }} content={<FlowTooltip currency={currency} />} />
            <Bar
              dataKey="inflow"
              radius={[3, 3, 0, 0]}
              maxBarSize={9}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              cursor="pointer"
              onClick={(data) => navigateToPoint((data as { dateKey?: string }).dateKey)}
            >
              {chartData.map((entry) => (
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
              cursor="pointer"
              onClick={(data) => navigateToPoint((data as { dateKey?: string }).dateKey)}
            >
              {chartData.map((entry) => (
                <Cell key={`out-${entry.label}`} fill="var(--negative)" fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
