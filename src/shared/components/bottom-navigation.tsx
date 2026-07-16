"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Activity, Plus, Users, User } from "lucide-react"
import { cn } from "@/src/lib/utils"

// ─── Config ───────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  href: string
  Icon: React.ComponentType<any>
  isCta?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/", Icon: Home },
  { id: "activity", label: "Activity", href: "/transactions", Icon: Activity },
  { id: "add", label: "Add", href: "#", Icon: Plus, isCta: true },
  { id: "groups", label: "Groups", href: "/split", Icon: Users },
  { id: "profile", label: "You", href: "/profile", Icon: User },
]

// ─── BottomNavigation ────────────────────────────────────────────────────────

interface BottomNavigationProps {
  onAddPress?: () => void
}

/**
 * Fixed bottom navigation bar.
 * Glassmorphism surface, animated active tab, center CTA "Add" button.
 */
export function BottomNavigation({ onAddPress }: BottomNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className="w-full max-w-[430px] pointer-events-auto"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingTop: "0px",
        }}
      >
        <div
          className="flex items-center justify-around rounded-[24px] relative overflow-hidden"
          style={{
            height: "64px",
            background: "rgba(3, 7, 18, 0.88)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04)",
          }}
        >
          {/* Ambient gradient glow from active tab */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(124,58,237,0.08), transparent)",
            }}
          />

          {NAV_ITEMS.map((item) => {
            if (item.isCta) {
              return (
                <CtaButton key={item.id} onPress={onAddPress} />
              )
            }

            const active = isActive(item.href)

            return (
              <NavTab
                key={item.id}
                item={item}
                active={active}
              />
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ─── NavTab ───────────────────────────────────────────────────────────────────

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1",
        "flex-1 h-full min-w-0",
        "transition-opacity",
        active ? "opacity-100" : "opacity-100"
      )}
    >
      {/* Active pill background */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="nav-active-bg"
            className="absolute top-2 left-1/2 -translate-x-1/2 rounded-[12px]"
            style={{
              width: "44px",
              height: "32px",
              background: "rgba(124, 58, 237, 0.18)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        animate={{
          color: active ? "#9F6EF5" : "rgba(249,250,251,0.40)",
          y: active ? -1 : 0,
          scale: active ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="relative"
      >
        <item.Icon
          className="w-5 h-5"
          strokeWidth={active ? 2.2 : 1.8}
        />
      </motion.div>

      {/* Label */}
      <motion.span
        animate={{
          color: active ? "#9F6EF5" : "rgba(249,250,251,0.38)",
          opacity: active ? 1 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        className="text-[10px] font-medium leading-none tracking-wide relative"
      >
        {item.label}
      </motion.span>

      {/* Active dot */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: "#7C3AED" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />
        )}
      </AnimatePresence>
    </Link>
  )
}

// ─── CTA Button (Add) ────────────────────────────────────────────────────────

function CtaButton({ onPress }: { onPress?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full">
      <motion.button
        aria-label="Add expense"
        onClick={onPress}
        className="relative flex items-center justify-center rounded-[16px] overflow-hidden"
        style={{
          width: "52px",
          height: "40px",
          background: "linear-gradient(135deg, #FF008C 0%, #7C3AED 100%)",
          boxShadow: "0 4px 20px rgba(180, 20, 160, 0.50), 0 2px 8px rgba(0,0,0,0.4)",
          marginTop: "-6px",
        }}
        whileTap={{ scale: 0.90 }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        {/* Animated shine */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.20) 0%, transparent 60%)",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Plus className="w-5 h-5 text-white relative" strokeWidth={2.5} />
      </motion.button>
      <span
        className="text-[10px] font-medium mt-1 leading-none"
        style={{ color: "rgba(249,250,251,0.38)" }}
      >
        Add
      </span>
    </div>
  )
}