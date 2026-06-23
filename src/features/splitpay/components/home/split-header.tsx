"use client"

import { motion } from "framer-motion"
import { Bell } from "lucide-react"

interface SplitHeaderProps {
  userName:          string
  notificationCount?: number
}

export function SplitHeader({ userName, notificationCount = 0 }: SplitHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-2">
      {/* Logo — slides in from left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-baseline gap-0"
        aria-label="SplitFin"
      >
        <span
          className="text-[22px] font-black tracking-tight text-[#F9FAFB]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Split
        </span>
        <span
          className="text-[22px] font-black tracking-tight"
          style={{
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #FF008C 0%, #7C3AED 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fin
        </span>
      </motion.div>

      {/* Bell — slides in from right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      >
        <motion.button
          aria-label={
            notificationCount > 0
              ? `${notificationCount} notifications`
              : "Notifications"
          }
          className="relative flex items-center justify-center"
          style={{
            width:           "38px",
            height:          "38px",
            borderRadius:    "12px",
            background:      "rgba(255,255,255,0.05)",
            border:          "1px solid rgba(255,255,255,0.09)",
            color:           "rgba(249,250,251,0.75)",
            backdropFilter:  "blur(12px)",
            cursor:          "pointer",
          }}
          whileTap={{ scale: 0.94 }}
          whileHover={{
            background: "rgba(255,255,255,0.09)",
            borderColor: "rgba(124,58,237,0.35)",
            color: "#F9FAFB",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <Bell size={17} strokeWidth={1.8} />

          {/* Notification badge */}
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24, delay: 0.4 }}
              className="absolute -top-1 -right-1 flex items-center justify-center"
              style={{
                width:      "16px",
                height:     "16px",
                borderRadius:"50%",
                background: "linear-gradient(135deg, #FF008C, #7C3AED)",
                fontSize:   "9px",
                fontWeight: "700",
                color:      "#fff",
                border:     "1.5px solid #030712",
              }}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    </header>
  )
}