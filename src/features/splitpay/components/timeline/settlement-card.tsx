"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { staggerItem } from "@/src/features/splitpay/motions/motion"
import type { TimelineCard } from "../../types"

interface SettlementCardProps {
  card: TimelineCard
  isLast: boolean
}

export function SettlementCard({ card, isLast }: SettlementCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="relative"
      style={{
        paddingBottom: isLast ? "0" : "16px",
      }}
    >
      <div
        className="rounded-[16px] p-4"
        style={{
          background: "rgba(0,229,195,0.06)",
          border: "1px solid rgba(0,229,195,0.18)",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0,229,195,0.15)",
              border: "1px solid rgba(0,229,195,0.3)",
            }}
          >
            <CheckCircle size={18} style={{ color: "#00E5C3" }} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold truncate"
              style={{ fontSize: "15px", color: "#F9FAFB" }}
            >
              {card.title}
            </p>
            <p
              className="mt-0.5 truncate"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}
            >
              {card.subtitle}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="font-bold"
                style={{ fontSize: "16px", color: "#00E5C3" }}
              >
                ₹{card.amount.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
