"use client"

import { motion } from "framer-motion"
import { Plus, Zap } from "lucide-react"
import { fadeUp, springs } from "@/src/features/splitpay/motions/motion"

interface GroupActionsProps {
  onAddExpense: () => void
  onSettleUp:   () => void
}

export function GroupActions({ onAddExpense, onSettleUp }: GroupActionsProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.16 }}
      className="flex gap-3 mx-5"
    >
      {/* Add Expense — primary gradient */}
      <ActionBtn
        label="+ Add Expense"
        icon={<Plus size={16} strokeWidth={2.5} />}
        onClick={onAddExpense}
        style={{
          flex:       1,
          background: "linear-gradient(135deg, #FF0A7A, #8B5CF6)",
          boxShadow:  "0 4px 20px rgba(255,10,122,0.35), 0 2px 8px rgba(0,0,0,0.4)",
          color:      "#fff",
          border:     "none",
        }}
        hoverShadow="0 6px 28px rgba(255,10,122,0.50), 0 4px 12px rgba(0,0,0,0.4)"
      />

      {/* Settle Up — outline glass */}
      <ActionBtn
        label="Settle Up"
        icon={<Zap size={15} strokeWidth={2} />}
        onClick={onSettleUp}
        style={{
          flex:       1,
          background: "rgba(0,229,195,0.07)",
          border:     "1px solid rgba(0,229,195,0.28)",
          color:      "#00E5C3",
          boxShadow:  "0 0 12px rgba(0,229,195,0.12)",
        }}
        hoverShadow="0 0 20px rgba(0,229,195,0.25)"
      />
    </motion.div>
  )
}

// ─── Reusable action button ───────────────────────────────────────────────────

interface ActionBtnProps {
  label:       string
  icon:        React.ReactNode
  onClick:     () => void
  style:       React.CSSProperties
  hoverShadow: string
}

function ActionBtn({ label, icon, onClick, style, hoverShadow }: ActionBtnProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center justify-center gap-2 font-semibold"
      style={{
        height:       "46px",
        borderRadius: "14px",
        fontSize:     "14px",
        cursor:       "pointer",
        ...style,
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ boxShadow: hoverShadow, scale: 1.01 }}
      transition={springs.snappy}
    >
      {icon}
      {label}
    </motion.button>
  )
}