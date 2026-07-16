'use client'

import { CategoryIcon } from '@/src/shared/components/category-icon'
import { formatCurrency } from '@/src/shared/lib/format'
import type { CategorySummary, Currency } from '@/src/types/transaction'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CategoryOrbitProps {
  categories: CategorySummary[]
  currency: Currency
}

/**
 * Satellite anchor slots (percent of container) with perceived depth.
 * depth: 1 = foreground (larger/brighter), 0 = rear (smaller/dimmer).
 */
const anchors: { x: number; y: number; depth: number }[] = [
  { x: 22, y: 17, depth: 0.9 },
  { x: 79, y: 20, depth: 0.75 },
  { x: 12, y: 52, depth: 0.65 },
  { x: 88, y: 52, depth: 0.8 },
  { x: 25, y: 84, depth: 1 },
  { x: 75, y: 84, depth: 0.95 },
  { x: 50, y: 7, depth: 0.55 },
  { x: 50, y: 94, depth: 0.85 },
]

const spring = { type: 'spring' as const, stiffness: 190, damping: 24 }

/** Dimensional glass orb — dark lower hemisphere, top light, rim light, inner core. */
function orbStyle(color: string, dominant: boolean) {
  return {
    background: `
      radial-gradient(circle at 32% 26%, rgba(255,255,255,0.14), transparent 42%),
      radial-gradient(circle at 50% 42%, color-mix(in srgb, ${color} ${dominant ? 34 : 22}%, transparent), transparent 72%),
      radial-gradient(circle at 50% 118%, rgba(0,0,0,0.85), transparent 62%),
      rgba(12, 13, 28, 0.88)
    `,
    border: `1px solid color-mix(in srgb, ${color} ${dominant ? 55 : 38}%, transparent)`,
    boxShadow: `
      inset 0 1px 1px rgba(255,255,255,0.12),
      inset 0 -10px 22px rgba(0,0,0,0.55),
      0 0 ${dominant ? 34 : 16}px color-mix(in srgb, ${color} ${dominant ? 30 : 16}%, transparent)
    `,
  }
}

export function CategoryOrbit({ categories, currency }: CategoryOrbitProps) {
  const reduced = useReducedMotion()
  const sorted = [...categories].sort((a, b) => b.amount - a.amount)

  // arrangement[0] = center; the rest fill anchor slots in order.
  const [arrangement, setArrangement] = useState<string[]>(() => sorted.map((c) => c.id))

  // Reconcile when the filtered category set changes: keep selection when valid,
  // otherwise promote the highest-spend category.
  useEffect(() => {
    setArrangement((prev) => {
      const validIds = new Set(sorted.map((c) => c.id))
      const kept = prev.filter((id) => validIds.has(id))
      const missing = sorted.map((c) => c.id).filter((id) => !kept.includes(id))
      const next = [...kept, ...missing]
      return next.length > 0 ? next : sorted.map((c) => c.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const byId = new Map(sorted.map((c) => [c.id, c]))
  const center = byId.get(arrangement[0]) ?? sorted[0]
  if (!center) return null
  const satellites = arrangement.slice(1, 9).map((id) => byId.get(id)).filter(Boolean) as CategorySummary[]

  function promote(id: string) {
    setArrangement((prev) => {
      const i = prev.indexOf(id)
      if (i <= 0) return prev
      const next = [...prev]
        // Swap: tapped node moves to center; center recedes to the tapped slot.
        ;[next[0], next[i]] = [next[i], next[0]]
      return next
    })
  }

  return (
    <div
      className="ambient-haze relative mx-auto mb-16 w-full"
      style={
        {
          aspectRatio: '10 / 11.5',
          '--haze-color': `color-mix(in srgb, ${center.color} 12%, transparent)`,
        } as React.CSSProperties
      }
    >
      {/* Partial orbital arcs with depth fading + traveling light points */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="orbit-arc-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9b5cff" stopOpacity="0" />
            <stop offset="45%" stopColor="#9b5cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14d9ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbit-arc-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14d9ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#7c3cff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7c3cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Inner orbit — partial arcs, not perfect circles */}
        <path
          d="M 22 30 A 32 30 0 0 1 82 36"
          fill="none"
          stroke="url(#orbit-arc-a)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 80 72 A 32 30 0 0 1 18 66"
          fill="none"
          stroke="url(#orbit-arc-b)"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 10 48 A 42 40 0 0 1 34 12"
          fill="none"
          stroke="url(#orbit-arc-a)"
          strokeWidth="0.3"
          opacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 92 44 A 42 40 0 0 1 66 90"
          fill="none"
          stroke="url(#orbit-arc-b)"
          strokeWidth="0.3"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Traveling light points */}
        {!reduced && (
          <>
            <circle r="0.7" fill="#9b5cff" opacity="0.9">
              <animateMotion dur="16s" repeatCount="indefinite" path="M 22 30 A 32 30 0 0 1 82 36" />
            </circle>
            <circle r="0.55" fill="#14d9ff" opacity="0.7">
              <animateMotion dur="20s" repeatCount="indefinite" path="M 80 72 A 32 30 0 0 1 18 66" />
            </circle>
          </>
        )}
      </svg>

      {/* ============ CENTER — dominant selected 3D glass orb ============ */}
      <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-[56%]">
        <div className="relative flex flex-col items-center">
          {/* Pedestal — concentric illuminated rings + reflection */}
          <div
            aria-hidden="true"
            className="absolute -bottom-7 left-1/2 -translate-x-1/2"
            style={{ width: 170, height: 56 }}
          >
            <div
              className="absolute inset-0 rounded-[50%] transition-colors duration-500"
              style={{
                background: `radial-gradient(ellipse at center, color-mix(in srgb, ${center.color} 22%, transparent), transparent 68%)`,
                filter: 'blur(6px)',
              }}
            />
            <div
              className="absolute inset-x-3 top-2 bottom-2 rounded-[50%] border transition-colors duration-500"
              style={{ borderColor: `color-mix(in srgb, ${center.color} 42%, transparent)` }}
            />
            <div
              className="absolute inset-x-8 top-4 bottom-4 rounded-[50%] border transition-colors duration-500"
              style={{ borderColor: `color-mix(in srgb, ${center.color} 26%, transparent)` }}
            />
            <div
              className="absolute inset-x-12 top-6 bottom-5 rounded-[50%] transition-colors duration-500"
              style={{
                background: `radial-gradient(ellipse at center, color-mix(in srgb, ${center.color} 30%, transparent), transparent 70%)`,
                filter: 'blur(3px)',
              }}
            />
          </div>

          <motion.button
            key={center.id}
            layoutId={`orbit-${center.id}`}
            transition={spring}
            type="button"
            aria-label={`${center.name}, selected category, ${formatCurrency(center.amount, currency)}, ${center.percent}% of total`}
            className="relative flex size-36 flex-col items-center justify-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            style={orbStyle(center.color, true)}
          >
            {/* Luminous inner core */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-[62%] rounded-full"
              style={{
                background: `radial-gradient(circle, color-mix(in srgb, ${center.color} 40%, transparent), transparent 70%)`,
                filter: 'blur(8px)',
              }}
            />
            <motion.span
              animate={reduced ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex size-14 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${center.color} 55%, transparent), color-mix(in srgb, ${center.color} 18%, transparent))`,
                boxShadow: `inset 0 1px 1px rgba(255,255,255,0.25), 0 6px 16px rgba(0,0,0,0.5)`,
                color: '#fdfdff',
              }}
            >
              <CategoryIcon name={center.icon} className="size-6" />
            </motion.span>
            <span className="relative text-sm font-bold">{center.name}</span>
          </motion.button>

          {/* Info integrated into the central composition */}
          <motion.div
            key={`info-${center.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...spring }}
            className="relative z-10 mt-9 flex flex-col items-center"
          >
            <p className="text-base font-extrabold tabular-nums">{formatCurrency(center.amount, currency)}</p>
            <p className="text-xs font-semibold" style={{ color: center.color }}>
              {center.percent}%
            </p>
          </motion.div>
        </div>
      </div>

      {/* ============ SATELLITES — depth-layered glass nodes ============ */}
      {satellites.map((cat, i) => {
        const anchor = anchors[i]
        if (!anchor) return null
        // Node prominence from category share, clamped for readability, scaled by depth
        const base = Math.max(46, Math.min(72, cat.percent * 4.2))
        const size = Math.round(base * (0.82 + anchor.depth * 0.18))
        return (
          <div
            key={cat.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${anchor.x}%`, top: `${anchor.y}%`, zIndex: anchor.depth > 0.8 ? 10 : 5 }}
          >
            <motion.button
              layoutId={`orbit-${cat.id}`}
              transition={spring}
              type="button"
              onClick={() => promote(cat.id)}
              aria-label={`Select ${cat.name}: ${formatCurrency(cat.amount, currency)}, ${cat.percent}% of total`}
              className="flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
              style={{
                width: size,
                height: size,
                opacity: 0.55 + anchor.depth * 0.45,
                ...orbStyle(cat.color, false),
              }}
              whileTap={{ scale: 0.92 }}
            >
              <motion.span
                animate={reduced ? undefined : { y: [0, i % 2 === 0 ? -3 : 3, 0] }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
                style={{ color: cat.color }}
              >
                <CategoryIcon name={cat.icon} className="size-5" />
              </motion.span>
            </motion.button>
            <p
              className="mt-1.5 max-w-24 truncate text-center text-[11px] font-semibold"
              style={{ opacity: 0.7 + anchor.depth * 0.3 }}
            >
              {cat.name}
            </p>
            <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {formatCurrency(cat.amount, currency)}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: cat.color }}>
              {cat.percent}%
            </p>
          </div>
        )
      })}
    </div>
  )
}
