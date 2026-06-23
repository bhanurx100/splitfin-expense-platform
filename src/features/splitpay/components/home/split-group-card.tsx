"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { animate } from "framer-motion"
import type { GroupCardData } from "../../types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return "₹" + Math.abs(n).toLocaleString("en-IN")
}

// ─── Animated counter (local) ─────────────────────────────────────────────────

function useGroupCounter(target: number, triggerDelay: number) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const c = animate(0, Math.abs(target), {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setVal(Math.round(v)),
      })
      return () => c.stop()
    }, triggerDelay)
    return () => clearTimeout(t)
  }, [target, triggerDelay])
  return val
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  progress:  number   // 0–1
  isPositive:boolean
  delay:     number
}

function ProgressBar({ progress, isPositive, delay }: ProgressBarProps) {
  const fillColor = isPositive
    ? "linear-gradient(90deg, #00D4AE, #00FFD0)"
    : "linear-gradient(90deg, #FF008C, #FF4472)"

  return (
    <div
      className="relative overflow-hidden rounded-full"
      style={{
        height:     "3px",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: fillColor }}
        initial={{ width: "0%" }}
        animate={{ width: `${Math.min(progress * 100, 100)}%` }}
        transition={{
          duration: 1.0,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  )
}

// ─── Emoji Badge ──────────────────────────────────────────────────────────────

function EmojiBadge({ emoji }: { emoji: string }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width:        "44px",
        height:       "44px",
        borderRadius: "14px",
        background:   "rgba(255,255,255,0.06)",
        border:       "1px solid rgba(255,255,255,0.09)",
        fontSize:     "22px",
        lineHeight:   "1",
      }}
    >
      {emoji}
    </div>
  )
}

// ─── SplitGroupCard ───────────────────────────────────────────────────────────

interface SplitGroupCardProps {
  group:        GroupCardData
  /** Index drives stagger delay */
  index:        number
  /** Extra delay offset (hero card took some time) */
  baseDelay?:   number
}

export function SplitGroupCard({
  group,
  index,
  baseDelay = 0.5,
}: SplitGroupCardProps) {
  const isPositive  = group.direction === "receive"
  const staggerDelay= baseDelay + index * 0.08
  const counterDelay= (staggerDelay + 0.3) * 1000  // ms for useEffect

  const animatedBalance = useGroupCounter(group.yourBalance, counterDelay)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay:    staggerDelay,
        ease:     [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y:     -3,
        scale: 1.012,
        transition: { type: "spring", stiffness: 400, damping: 28 },
      }}
      whileTap={{ scale: 0.975 }}
    >
      <div
        className="relative overflow-hidden rounded-[18px] cursor-pointer"
        style={{
          background:         "rgba(255,255,255,0.04)",
          backdropFilter:     "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border:             "1px solid rgba(255,255,255,0.08)",
          boxShadow:          "0 2px 16px rgba(0,0,0,0.35)",
          transition:         "box-shadow 0.2s ease",
        }}
      >
        {/* Subtle inner glow from balance direction */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{
            background: isPositive
              ? "radial-gradient(circle at 90% 10%, rgba(0,255,208,0.07), transparent 70%)"
              : "radial-gradient(circle at 90% 10%, rgba(255,0,140,0.07), transparent 70%)",
          }}
        />

        <div className="p-4">
          {/* Top row: emoji + name + balance */}
          <div className="flex items-center gap-3">
            <EmojiBadge emoji={group.emoji} />

            <div className="flex-1 min-w-0">
              <p
                className="font-semibold truncate"
                style={{ fontSize: "14px", color: "#F9FAFB" }}
              >
                {group.name}
              </p>
              <p
                className="text-[12px] mt-0.5"
                style={{ color: "rgba(249,250,251,0.45)" }}
              >
                {group.memberCount} members · {group.expenseCount} expenses
              </p>
            </div>

            {/* Balance */}
            <div className="text-right shrink-0">
              <p
                className="text-[10px] font-medium mb-0.5"
                style={{ color: "rgba(249,250,251,0.40)" }}
              >
                {isPositive ? "You will receive" : "You will pay"}
              </p>
              <p
                className="text-[15px] font-black tabular-nums"
                style={{
                  color:      isPositive ? "#00D4AE" : "#FF6B8F",
                  textShadow: isPositive
                    ? "0 0 10px rgba(0,212,174,0.35)"
                    : "0 0 10px rgba(255,107,143,0.35)",
                }}
              >
                {isPositive ? "+" : "-"}{formatINR(animatedBalance)}
              </p>
            </div>
          </div>

          {/* Settled / Pending chips row */}
          <div className="flex items-center gap-2 mt-3 mb-2.5">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,214,143,0.12)",
                color:      "#00D68F",
                border:     "1px solid rgba(0,214,143,0.20)",
              }}
            >
              {group.settledCount} settled
            </span>
            {group.pendingCount > 0 && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,184,0,0.10)",
                  color:      "#FFB800",
                  border:     "1px solid rgba(255,184,0,0.20)",
                }}
              >
                {group.pendingCount} pending
              </span>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar
            progress={group.settledProgress}
            isPositive={isPositive}
            delay={staggerDelay + 0.25}
          />
        </div>
      </div>
    </motion.div>
  )
}