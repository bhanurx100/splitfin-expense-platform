'use client'

import type { Insight } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import { CreditCard, Sparkles, Wallet, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  'credit-card': CreditCard,
  wallet: Wallet,
}

const toneColor: Record<Insight['tone'], string> = {
  positive: 'var(--positive)',
  negative: 'var(--negative)',
  warning: 'var(--warning)',
  info: 'var(--info)',
}

/** One insight at a time, rotating automatically. */
export function SmartInsights({ insights }: { insights: Insight[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (insights.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % insights.length), 6000)
    return () => clearInterval(id)
  }, [insights.length])

  const insight = insights[index]
  const Icon = iconMap[insight.icon] ?? Sparkles
  const color = toneColor[insight.tone]

  return (
    <section aria-label="Smart insights" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Smart Insights</h2>

      <div
        className="glass relative overflow-hidden rounded-xl"
        style={{ borderColor: `color-mix(in oklch, ${color} 30%, transparent)` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 transition-colors duration-700"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 0% 50%, ${color}, transparent)`,
          }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative flex items-center gap-4 p-5"
            aria-live="polite"
          >
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`,
                color,
              }}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{insight.title}</p>
              <p className="mt-0.5 text-pretty text-xs leading-relaxed text-muted-foreground">
                {insight.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative flex justify-center gap-1.5 pb-3" aria-hidden="true">
          {insights.map((item, i) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-4 bg-primary' : 'w-1 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
