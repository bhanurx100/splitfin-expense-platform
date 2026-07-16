'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

export interface DonutSegment {
  id: string
  percent: number
  color: string
  label: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  selectedId?: string | null
  onSelect?: (id: string) => void
  children?: React.ReactNode
  label: string
}

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 18,
  selectedId,
  onSelect,
  children,
  label,
}: DonutChartProps) {
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

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        {arcs.map((arc, i) => {
          const dimmed = selectedId != null && selectedId !== arc.id
          return (
            <motion.circle
              key={arc.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={selectedId === arc.id ? strokeWidth + 4 : strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: dimmed ? 0.3 : 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              onClick={onSelect ? () => onSelect(arc.id) : undefined}
              style={{ cursor: onSelect ? 'pointer' : 'default', transition: 'stroke-width 0.3s, opacity 0.3s' }}
            />
          )
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  )
}
