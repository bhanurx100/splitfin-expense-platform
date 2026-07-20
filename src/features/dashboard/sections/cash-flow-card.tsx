'use client'

import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { CashFlowPeriod, CashFlowPoint, Currency } from '@/src/types/transaction'
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

const periods: CashFlowPeriod[] = ['1M', '3M', '6M', '1Y']

/**
 * Display caps per period — any bar above the cap renders at the cap's
 * height so small payments stay visible (salary days would otherwise
 * flatten everything else). The tooltip always shows the real value.
 */
const periodCap: Record<CashFlowPeriod, number> = {
  '1M': 5000,
  '3M': 30000,
  '6M': 30000,
  '1Y': 120000,
}

/** Premium glass tooltip — white typography, breathing room, soft shadow. */
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
  // Real values live on the datum — bar heights may be display-capped.
  const datum = payload[0]?.payload as { inflowRaw?: number; outflowRaw?: number } | undefined
  const inflow = Math.abs(datum?.inflowRaw ?? 0)
  const outflow = Math.abs(datum?.outflowRaw ?? 0)
  return (
    <div
      className="min-w-36 rounded-2xl border border-white/12 px-3.5 py-2.5 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(160deg, rgba(22,24,38,0.92), rgba(14,15,26,0.88))',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 24px rgba(124,60,255,0.12)',
      }}
    >
      <p className="text-[11px] font-semibold tracking-wide text-white/95">{label}</p>
      <div className="mt-1.5 flex flex-col gap-1">
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="size-1.5 rounded-full bg-info" aria-hidden /> Income
          </span>
          <span className="font-bold text-white">{formatCurrency(inflow, currency)}</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="size-1.5 rounded-full bg-negative" aria-hidden /> Expense
          </span>
          <span className="font-bold text-white">{formatCurrency(outflow, currency)}</span>
        </p>
      </div>
    </div>
  )
}

/**
 * Cash Flow — every period renders a REAL series derived from the
 * transaction store (daily / weekly / monthly buckets). Income grows
 * above the baseline, expense below it: true flow direction.
 */
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
  const chartData = useMemo(
    () =>
      (seriesByPeriod[period] ?? []).map((d) => ({
        label: d.label,
        inflow: Math.min(d.inflow, cap),
        outflow: -Math.min(Math.abs(d.outflow), cap),
        outflowAbs: Math.min(Math.abs(d.outflow), cap),
        inflowRaw: d.inflow,
        outflowRaw: Math.abs(d.outflow),
      })),
    [seriesByPeriod, period, cap],
  )

  const maxAbs = useMemo(
    () => Math.max(...chartData.map((d) => Math.max(d.inflow, d.outflowAbs)), 1),
    [chartData],
  )

  // Thin the axis on long series so labels never collide.
  const tickInterval = chartData.length > 14 ? Math.ceil(chartData.length / 7) - 1 : 'preserveStartEnd'

  if (chartData.length === 0) {
    return (
      <GlassCard strong className="flex flex-col gap-2 p-5">
        <h2 className="text-lg font-bold">Cash Flow</h2>
        <p className="py-6 text-center text-xs text-muted-foreground">
          Cash flow appears once you have transactions.
        </p>
      </GlassCard>
    )
  }

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
            <Tooltip
              cursor={{ fill: 'oklch(1 0 0 / 6%)' }}
              content={<FlowTooltip currency={currency} />}
            />
            <Bar
              dataKey="inflow"
              radius={[3, 3, 0, 0]}
              maxBarSize={9}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
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
