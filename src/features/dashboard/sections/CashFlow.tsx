"use client"

import { useId, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  type RangeKey,
  type Transaction,
  ranges,
  dailySeries,
  axisLabels,
  formatCompactINR,
  formatINR,
} from "@/src/features/dashboard/lib/store"

interface Props {
  transactions: Transaction[]
  isDark: boolean
}

const W = 320
const H = 220
const AXIS_Y = H / 2
const PAD = 6
const HALF = AXIS_Y - PAD

// Fixed axis steps. 10000 is the visual limit — anything beyond is a soft
// extension above/below this line, never a rescale.
const AXIS_STEPS = [0, 250, 500, 750, 1000, 1500, 2000]
const VISUAL_LIMIT = 10000
// How far (in px) values beyond the limit are allowed to extend, on top of HALF.
const OUTLIER_EXTENSION = 22

const INCOME_COLOR = "#00D68F"
const EXPENSE_COLOR = "#FF5A8A"

/** Monotone cubic interpolation — no overshoot, no gaming-style spikes. */
function monotonePath(points: { x: number; y: number }[]): string {
  const n = points.length
  if (n === 0) return ""
  if (n === 1) return `M ${points[0].x} ${points[0].y}`
  if (n === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i]
    d[i] = dx === 0 ? 0 : (ys[i + 1] - ys[i]) / dx
  }
  const m: number[] = new Array(n)
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0
    } else {
      m[i] = (d[i - 1] + d[i]) / 2
    }
  }
  // Fritsch-Carlson monotonicity adjustment
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      m[i] = tau * a * d[i]
      m[i + 1] = tau * b * d[i]
    }
  }

  let path = `M ${xs[0]} ${ys[0]}`
  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i]
    const cp1x = xs[i] + dx / 3
    const cp1y = ys[i] + (m[i] * dx) / 3
    const cp2x = xs[i + 1] - dx / 3
    const cp2y = ys[i + 1] - (m[i + 1] * dx) / 3
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xs[i + 1]} ${ys[i + 1]}`
  }
  return path
}

/**
 * Maps a value (0..VISUAL_LIMIT range, possibly beyond) to a pixel distance
 * from the axis. Values up to VISUAL_LIMIT map linearly to HALF. Anything
 * beyond is soft-clamped with a small fixed extension — never rescales.
 */
function valueToDistance(v: number): number {
  if (v <= 0) return 0
  if (v <= VISUAL_LIMIT) return (v / VISUAL_LIMIT) * HALF
  // soft extension: asymptotically approach HALF + OUTLIER_EXTENSION
  const overshoot = v - VISUAL_LIMIT
  const t = overshoot / (overshoot + VISUAL_LIMIT) // 0..1, never reaches 1
  return HALF + t * OUTLIER_EXTENSION
}

export function CashFlow({ transactions, isDark }: Props) {
  const uid = useId().replace(/:/g, "")
  const [range, setRange] = useState<RangeKey>("1M")
  const [active, setActive] = useState<number | null>(null)

  const { incomePath, expensePath, incomeArea, expenseArea, series, labels, hasIncomeOutlier, hasExpenseOutlier } =
    useMemo(() => {
      const series = dailySeries(transactions, range)
      const n = series.length

      const toX = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W)

      const incomePts = series.map((d, i) => ({
        x: toX(i),
        y: AXIS_Y - valueToDistance(d.income),
      }))
      const expensePts = series.map((d, i) => ({
        x: toX(i),
        y: AXIS_Y + valueToDistance(d.expense),
      }))

      const incomePath = monotonePath(incomePts)
      const expensePath = monotonePath(expensePts)

      const incomeArea = `${incomePath} L ${W} ${AXIS_Y} L 0 ${AXIS_Y} Z`
      const expenseArea = `${expensePath} L ${W} ${AXIS_Y} L 0 ${AXIS_Y} Z`

      const hasIncomeOutlier = series.some((d) => d.income > VISUAL_LIMIT)
      const hasExpenseOutlier = series.some((d) => d.expense > VISUAL_LIMIT)

      return {
        incomePath,
        expensePath,
        incomeArea,
        expenseArea,
        series,
        labels: axisLabels(series, range),
        hasIncomeOutlier,
        hasExpenseOutlier,
      }
    }, [transactions, range])

  const activePoint = active != null ? series[active] : null

  const incomePoint = activePoint
    ? { x: series.length <= 1 ? 0 : (active! / (series.length - 1)) * W, y: AXIS_Y - valueToDistance(activePoint.income) }
    : null
  const expensePoint = activePoint
    ? { x: series.length <= 1 ? 0 : (active! / (series.length - 1)) * W, y: AXIS_Y + valueToDistance(activePoint.expense) }
    : null

  const setActiveFromX = (clientX: number, rect: DOMRect) => {
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const idx = Math.round(ratio * (series.length - 1))
    setActive(idx)
  }

  return (
    <section aria-label="Cash flow" className="glass rounded-[2rem] p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Cash Flow</h2>
          <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: INCOME_COLOR }} />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: EXPENSE_COLOR }} />
              Spend
            </span>
          </p>
        </div>

        <div className="flex rounded-full bg-secondary/70 p-1">
          {ranges.map((r) => {
            const selected = r.key === range
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className="relative rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                aria-pressed={selected}
              >
                {selected && (
                  <motion.span
                    layoutId={`range-pill-${uid}`}
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={selected ? "relative text-primary-foreground" : "relative text-muted-foreground"}>
                  {r.label}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <div className="relative mt-4">
        {(hasIncomeOutlier || hasExpenseOutlier) && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 text-[9px] font-medium text-muted-foreground">
            <span className="rounded-full bg-secondary px-1.5 py-0.5">{">"}10k extends beyond axis</span>
          </div>
        )}

        <div className="flex gap-2">
          {/* Y-axis labels — fixed steps, always visible */}
          <div className="flex shrink-0 flex-col justify-between text-right text-[9px] leading-none text-muted-foreground" style={{ height: H }}>
            <div className="flex flex-1 flex-col-reverse justify-between pb-0.5">
              {AXIS_STEPS.slice(1).map((v) => (
                <span key={`inc-${v}`}>{formatCompactINR(v)}</span>
              ))}
            </div>
            <span className="py-0.5">0</span>
            <div className="flex flex-1 flex-col justify-between pt-0.5">
              {AXIS_STEPS.slice(1).map((v) => (
                <span key={`exp-${v}`}>{formatCompactINR(v)}</span>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full overflow-visible"
              style={{ height: H }}
              preserveAspectRatio="none"
              role="img"
              tabIndex={0}
              aria-label="Income and spending wave chart. Use arrow keys to inspect days."
              onMouseMove={(e) => setActiveFromX(e.clientX, e.currentTarget.getBoundingClientRect())}
              onMouseLeave={() => setActive(null)}
              onTouchStart={(e) => setActiveFromX(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
              onTouchMove={(e) => setActiveFromX(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActive((a) => Math.min(series.length - 1, (a ?? -1) + 1))
                if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? 1) - 1))
                if (e.key === "Escape") setActive(null)
              }}
            >
              <defs>
                <linearGradient id={`inc-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`exp-${uid}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                </linearGradient>
                <filter id={`glow-${uid}`} x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feComponentTransfer in="b" result="bd">
                    <feFuncA type="linear" slope="0.2" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="bd" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Subtle grid lines — opacity 0.05 */}
              {AXIS_STEPS.slice(1).map((v) => (
                <line
                  key={`gl-inc-${v}`}
                  x1={0}
                  x2={W}
                  y1={AXIS_Y - valueToDistance(v)}
                  y2={AXIS_Y - valueToDistance(v)}
                  stroke="currentColor"
                  strokeOpacity={0.05}
                  strokeWidth={1}
                />
              ))}
              {AXIS_STEPS.slice(1).map((v) => (
                <line
                  key={`gl-exp-${v}`}
                  x1={0}
                  x2={W}
                  y1={AXIS_Y + valueToDistance(v)}
                  y2={AXIS_Y + valueToDistance(v)}
                  stroke="currentColor"
                  strokeOpacity={0.05}
                  strokeWidth={1}
                />
              ))}

              {/* Center x-axis */}
              <line x1={0} x2={W} y1={AXIS_Y} y2={AXIS_Y} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />

              <AnimatePresence mode="wait">
                <motion.g key={range} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {/* Expense wave — below axis only */}
                  <motion.path d={expenseArea} fill={`url(#exp-${uid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
                  <motion.path
                    d={expensePath}
                    fill="none"
                    stroke={EXPENSE_COLOR}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#glow-${uid})`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                  />

                  {/* Income wave — above axis only */}
                  <motion.path d={incomeArea} fill={`url(#inc-${uid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }} />
                  <motion.path
                    d={incomePath}
                    fill="none"
                    stroke={INCOME_COLOR}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#glow-${uid})`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                  />
                </motion.g>
              </AnimatePresence>

              {active != null && series.length > 1 && (
                <line
                  x1={(active / (series.length - 1)) * W}
                  x2={(active / (series.length - 1)) * W}
                  y1={0}
                  y2={H}
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeWidth={1}
                />
              )}

              {incomePoint && (
                <circle cx={incomePoint.x} cy={incomePoint.y} r={4} fill={INCOME_COLOR} stroke="var(--card)" strokeWidth={2} />
              )}
              {expensePoint && (
                <circle cx={expensePoint.x} cy={expensePoint.y} r={4} fill={EXPENSE_COLOR} stroke="var(--card)" strokeWidth={2} />
              )}
            </svg>

            {/* x-axis labels — always visible */}
            <div className="relative mt-1 h-4">
              {labels.map((l) => (
                <span
                  key={l.index}
                  className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
                  style={{ left: `${series.length <= 1 ? 0 : (l.index / (series.length - 1)) * 100}%` }}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Glass tooltip card */}
        <AnimatePresence>
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="mt-2 rounded-2xl border px-3 py-2.5 text-xs"
              style={{
                background: "color-mix(in oklab, var(--card) 70%, transparent)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              }}
            >
              <p className="font-semibold">
                {new Date(activePoint.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Income</span>
                <span className="font-semibold tabular-nums" style={{ color: INCOME_COLOR }}>
                  {formatINR(activePoint.income)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Expense</span>
                <span className="font-semibold tabular-nums" style={{ color: EXPENSE_COLOR }}>
                  {formatINR(activePoint.expense)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-1">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-semibold tabular-nums">{activePoint.count}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}