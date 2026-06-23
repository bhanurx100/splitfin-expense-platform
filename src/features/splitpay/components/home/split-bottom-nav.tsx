"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  LayoutGrid,
  ArrowLeftRight,
  Users,
  CreditCard,
  PieChart,
} from "lucide-react"
import type { SplitNavItem } from "../../types"

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ size?: number; strokeWidth?: number; className?: string }>> = {
  home:              LayoutGrid,
  "arrow-left-right":ArrowLeftRight,
  users:             Users,
  "credit-card":     CreditCard,
  "pie-chart":       PieChart,
}

// ─── SplitPay active icon with breathing glow ─────────────────────────────────

function SplitPayIcon() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={{ scale: [1, 1.03, 1] }}
      transition={{
        duration:  3,
        repeat:    Infinity,
        ease:      "easeInOut",
        repeatType:"loop",
      }}
    >
      {/* Glow halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:  "rgba(124,58,237,0.30)",
          filter:      "blur(8px)",
          transform:   "scale(1.6)",
        }}
      />
      <Users
        size={21}
        strokeWidth={2.2}
        className="relative z-10"
        style={{ color: "#9F6EF5" }}
      />
    </motion.div>
  )
}

// ─── SplitBottomNav ───────────────────────────────────────────────────────────

interface SplitBottomNavProps {
  items: SplitNavItem[]
}

export function SplitBottomNav({ items }: SplitBottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className="w-full max-w-[430px] pointer-events-auto"
        style={{
          padding: "0 12px",
          paddingBottom: "env(safe-area-inset-bottom, 14px)",
        }}
      >
        <div
          className="relative flex items-center justify-around rounded-[26px] overflow-hidden"
          style={{
            height:              "64px",
            background:          "rgba(3, 7, 18, 0.90)",
            backdropFilter:      "blur(40px) saturate(180%)",
            WebkitBackdropFilter:"blur(40px) saturate(180%)",
            border:              "1px solid rgba(255,255,255,0.08)",
            boxShadow:           "0 -2px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Ambient active tab glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 50% 90% at 50% 110%, rgba(124,58,237,0.10), transparent)",
            }}
          />

          {items.map((item) => (
            <NavTab key={item.id} item={item} />
          ))}
        </div>
      </div>
    </nav>
  )
}

// ─── NavTab ───────────────────────────────────────────────────────────────────

function NavTab({ item }: { item: SplitNavItem }) {
  const Icon = ICON_MAP[item.icon] ?? Users
  const isActive = item.isActive
  const isSplitPay = item.id === "splitpay"

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      className="relative flex flex-col items-center justify-center flex-1 h-full gap-1"
      style={{ textDecoration: "none" }}
    >
      {/* Active background pill */}
      {isActive && (
        <motion.div
          layoutId="split-nav-pill"
          className="absolute top-2 rounded-[12px]"
          style={{
            width:      "46px",
            height:     "30px",
            background: "rgba(124,58,237,0.16)",
            border:     "1px solid rgba(124,58,237,0.24)",
          }}
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isSplitPay && isActive ? (
          <SplitPayIcon />
        ) : (
          <Icon
            size={20}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{
              color:      isActive ? "#9F6EF5" : "rgba(249,250,251,0.36)",
              transition: "color 0.2s ease",
            }}
          />
        )}
      </div>

      {/* Label */}
      <span
        className="relative z-10 font-medium leading-none"
        style={{
          fontSize:   "10px",
          color:      isActive ? "#9F6EF5" : "rgba(249,250,251,0.36)",
          transition: "color 0.2s ease",
        }}
      >
        {item.label}
      </span>

      {/* Active dot */}
      {isActive && (
        <motion.div
          className="absolute bottom-1 rounded-full"
          style={{
            width:      "4px",
            height:     "4px",
            background: "#7C3AED",
            boxShadow:  "0 0 6px rgba(124,58,237,0.60)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        />
      )}
    </Link>
  )
}