"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Settings } from "lucide-react"
import { fadeUp, springs } from "@/src/features/splitpay/motions/motion"
import type { GroupSummary } from "@/src/features/splitpay/types"

interface GroupHeaderProps {
    summary: GroupSummary
    onBack: () => void
    onSettings: () => void
}

export function GroupHeader({ summary, onBack, onSettings }: GroupHeaderProps) {
    return (
        <motion.header
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="sticky top-0 z-40 flex items-center justify-between px-5 pt-5 pb-4"
            style={{
                background: "rgba(5,8,22,0.85)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            {/* Back button */}
            <motion.button
                aria-label="Go back"
                onClick={onBack}
                className="flex items-center justify-center"
                style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.80)",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
                whileTap={{ scale: 0.94 }}
                whileHover={{
                    background: "rgba(255,255,255,0.09)",
                    borderColor: "rgba(139,92,246,0.35)",
                }}
                transition={springs.snappy}
            >
                <ArrowLeft size={17} strokeWidth={2} />
            </motion.button>

            {/* Centre — emoji + title + count */}
            <motion.div
                className="flex flex-col items-center min-w-0 flex-1 mx-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            >
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>{summary.emoji}</span>
                    <h1
                        className="font-bold truncate"
                        style={{ fontSize: "17px", color: "#F9FAFB", letterSpacing: "-0.01em" }}
                    >
                        {summary.name}
                    </h1>
                </div>
                <p
                    className="mt-0.5"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)" }}
                >
                    {summary.memberCount} members
                </p>
            </motion.div>

            {/* Settings / three-dot */}
            <motion.button
                aria-label="Group settings"
                onClick={onSettings}
                className="flex items-center justify-center"
                style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.70)",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
                whileTap={{ scale: 0.94, rotate: 45 }}
                whileHover={{
                    background: "rgba(255,255,255,0.09)",
                    borderColor: "rgba(139,92,246,0.35)",
                    color: "#F9FAFB",
                }}
                transition={springs.snappy}
            >
                <Settings size={16} strokeWidth={1.8} />
            </motion.button>
        </motion.header>
    )
}