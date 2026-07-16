'use client'

import { GlassCard } from '@/src/shared/components/glass-card'
import { formatCurrency } from '@/src/shared/lib/format'
import type { CashFlowPoint } from '@/src/types/transaction'
import { cn } from '@/src/lib/utils'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const periods = ['1M', '3M', '6M', '1Y'] as const

export function CashFlowCard({ data }: { data: CashFlowPoint[] }) {
  const [period, setPeriod] = useState<string>('1M')
  const chartData = data.map((d) => ({ ...d, net: d.inflow - d.outflow }))

  return (
    <GlassCard strong className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-bold">Cash Flow</h2>
          <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div role="tablist" aria-label="Cash flow period" className="glass flex rounded-xl p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                'min-h-8 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                period === p
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={1} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'oklch(0.68 0.02 285)', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <Tooltip
              cursor={{ fill: 'oklch(1 0 0 / 5%)' }}
              contentStyle={{
                background: 'oklch(0.18 0.035 285)',
                border: '1px solid oklch(1 0 0 / 10%)',
                borderRadius: 16,
                fontSize: 12,
              }}
              formatter={(value) => [formatCurrency(Number(value)), '']}
              labelStyle={{ color: 'oklch(0.68 0.02 285)' }}
            />
            <Bar dataKey="inflow" radius={[4, 4, 0, 0]} maxBarSize={10}>
              {chartData.map((entry) => (
                <Cell key={`in-${entry.label}`} fill="var(--info)" />
              ))}
            </Bar>
            <Bar dataKey="outflow" radius={[4, 4, 0, 0]} maxBarSize={10}>
              {chartData.map((entry) => (
                <Cell key={`out-${entry.label}`} fill="var(--negative)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
