'use client'

import { crossfade, springs } from '@/src/shared/lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

export interface DonutSegment {
  id: string
  percent: number
  color: string
  label: string
  /** Formatted value shown in the center when this slice is active. */
  value?: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Externally controlled highlight (e.g. synced legend row hover). */
  activeId?: string | null
  /** Fired when the pointer highlights/unhighlights a slice. */
  onActiveChange?: (id: string | null) => void
  /** Default center content when nothing is active. */
  centerValue?: string
  centerLabel?: string
  children?: React.ReactNode
  label: string
}

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 18,
  selectedId,
  onSelect,
  activeId,
  onActiveChange,
  centerValue,
  centerLabel,
  children,
  label,
}: DonutChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const gap = segments.length > 1 ? 2.5 : 0

  const arcs = useMemo(() => {
    let offset = 0
    return segments.map((seg) => {
      const length = Math.max((seg.percent / 100) * circumference - gap, 2)
      const arc = { ...seg, length, offset }
      offset += (seg.percent / 100) * circumference
      return arc
    })
  }, [segments, circumference, gap])

  // Priority: externally controlled activeId → local hover → click selection
  const highlightId = activeId !== undefined ? activeId : (hoveredId ?? selectedId ?? null)
  const activeArc = arcs.find((a) => a.id === highlightId) ?? null

  const setActive = (id: string | null) => {
    setHoveredId(id)
    onActiveChange?.(id)
  }

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {arcs.map((arc) => {
          const active = highlightId === arc.id
          const dimmed = highlightId != null && !active
          return (
            <motion.circle
              key={arc.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeLinecap="round"
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              initial={false}
              animate={{
                opacity: dimmed ? 0.25 : 1,
                scale: active ? 1.05 : 1,
                strokeWidth: active ? strokeWidth + 6 : strokeWidth,
              }}
              transition={springs.soft}
              style={{
                cursor: onSelect ? 'pointer' : 'default',
                transformBox: 'fill-box',
                transformOrigin: 'center',
                filter: active ? `drop-shadow(0 0 10px ${arc.color}) drop-shadow(0 0 22px ${arc.color}66)` : 'none',
                transitionProperty: 'filter',
                transitionDuration: '0.3s',
              }}
              onPointerEnter={() => setActive(arc.id)}
              onPointerLeave={() => setActive(null)}
              onClick={onSelect ? () => onSelect(arc.id) : undefined}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {activeArc ? (
            <motion.div key={activeArc.id} {...crossfade} className="flex flex-col items-center">
              <span className="text-lg font-bold tabular-nums leading-tight text-foreground">
                {activeArc.value ?? `${Math.round(activeArc.percent)}%`}
              </span>
              <span className="mt-0.5 max-w-[110px] truncate text-[11px] font-medium text-muted-foreground">
                {activeArc.label}
              </span>
              <span
                className="mt-0.5 text-[10px] font-semibold tabular-nums"
                style={{ color: activeArc.color }}
              >
                {activeArc.percent.toFixed(1)}%
              </span>
            </motion.div>
          ) : children ? (
            <motion.div key="default-children" {...crossfade} className="flex flex-col items-center">
              {children}
            </motion.div>
          ) : (
            (centerValue != null || centerLabel != null) && (
              <motion.div key="default-center" {...crossfade} className="flex flex-col items-center">
                {centerValue != null && (
                  <span className="text-lg font-bold tabular-nums leading-tight text-foreground">
                    {centerValue}
                  </span>
                )}
                {centerLabel != null && (
                  <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    {centerLabel}
                  </span>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
