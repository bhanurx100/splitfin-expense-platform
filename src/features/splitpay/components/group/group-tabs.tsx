"use client"

import { motion } from "framer-motion"
import { fadeUp, springs } from "@/src/features/splitpay/motions/motion"
import type { GroupTab } from "@/src/features/splitpay/types"

interface GroupTabsProps {
  active: GroupTab
  onChange: (tab: GroupTab) => void
}

const TABS: { id: GroupTab; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "members", label: "Members" },
]

export function GroupTabs({ active, onChange }: GroupTabsProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.24 }}
      className="mx-5"
    >
      <div
        className="flex rounded-[16px] p-1"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 py-2.5 font-semibold rounded-[12px] transition-all"
            style={{
              fontSize: "14px",
              color: active === tab.id ? "#F9FAFB" : "rgba(255,255,255,0.45)",
              background:
                active === tab.id
                  ? "linear-gradient(135deg, #8B5CF6, #FF0A7A)"
                  : "transparent",
              border: "none",
              cursor: "pointer",
            }}
            whileTap={{ scale: 0.96 }}
            whileHover={
              active !== tab.id
                ? { background: "rgba(255,255,255,0.08)" }
                : undefined
            }
            transition={springs.snappy}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
