"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { staggerItem, springs } from "@/src/features/splitpay/motions/motion"
import type { TimelineCard } from "../../types"

// ─── Cyan particle burst (disappears after 1.2s) ──────────────────────────────

function CyanBurst() {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(false), 1200)
        return () => clearTimeout(t)
    }, [])

    if (!visible) return null

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            {[...Array(10)].map((_, i) => {
                const angle = (i / 10) * 360
                const dist = 30 + Math.random() * 20
                const rad = (angle * Math.PI) / 180

                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: 3 + Math.random() * 4,
                            height: 3 + Math.random() * 4,
                            background: "#00E5C3",
                            top: "50%",
                            left: "50%",
                        }}
                        initial={{ opacity: 1, x: 0, y: 0 }}
                        animate={{
                            opacity: 0,
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist,
                            scale: 0,
                        }}
                        transition={{ duration: 0.9 + Math.random() * 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                )
            })}
        </div>
    )
}

// ─── PaymentDetectedCard ──────────────────────────────────────────────────────

interface PaymentDetectedCardProps {
    card: TimelineCard
    isLast?: boolean
}

export function PaymentDetectedCard({ card, isLast }: PaymentDetectedCardProps) {
    const accent = "#00E5C3"
    const payer = card.payers[0]

    function fmtTime(iso: string) {
        return new Date(iso).toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: true,
        }).toUpperCase()
    }

    return (
        <motion.div
            variants={staggerItem}
            className="relative flex gap-3"
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
        >
            {/* Connector */}
            {!isLast && (
                <div
                    className="absolute left-[19px] top-[44px]"
                    style={{
                        width: "2px",
                        bottom: "-12px",
                        background: "linear-gradient(to bottom, rgba(0,229,195,0.20), rgba(0,229,195,0.02))",
                    }}
                />
            )}

            {/* Orb with burst */}
            <div
                className="relative shrink-0 flex items-center justify-center rounded-full z-10"
                style={{
                    width: "40px",
                    height: "40px",
                    marginTop: "2px",
                    background: "rgba(0,229,195,0.10)",
                    border: "1px solid rgba(0,229,195,0.30)",
                    boxShadow: "0 0 18px rgba(0,229,195,0.22)",
                }}
            >
                <CyanBurst />
                <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ ...springs.snappy, delay: 0.1 }}
                >
                    <Zap size={17} style={{ color: accent }} strokeWidth={2.2} fill={accent} />
                </motion.div>
            </div>

            {/* Card */}
            <motion.div
                className="flex-1 mb-3 rounded-[18px] overflow-hidden"
                style={{
                    background: "rgba(0,229,195,0.06)",
                    border: "1px solid rgba(0,229,195,0.22)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 0 20px rgba(0,229,195,0.08)",
                }}
                whileHover={{ scale: 1.008, boxShadow: "0 4px 24px rgba(0,229,195,0.16)" }}
                whileTap={{ scale: 0.985 }}
                transition={springs.gentle}
            >
                <div style={{ height: "2.5px", background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                <div className="p-3 flex items-start justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "#F9FAFB" }}>
                                {card.title}
                            </p>
                            <span
                                className="rounded-full px-1.5 py-0.5"
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    background: "rgba(0,229,195,0.14)",
                                    color: accent,
                                    border: "1px solid rgba(0,229,195,0.25)",
                                }}
                            >
                                Auto-detected
                            </span>
                        </div>

                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", marginTop: "2px" }}>
                            {card.subtitle}
                        </p>

                        {/* Via + Transaction ID */}
                        {card.via && (
                            <p style={{ fontSize: "11px", color: "rgba(0,229,195,0.75)", marginTop: "4px" }}>
                                via {card.via}
                                {card.transactionId ? ` · ${card.transactionId}` : ""}
                            </p>
                        )}

                        {/* Payer chip */}
                        {payer && (
                            <span
                                className="inline-flex items-center gap-1 mt-2 rounded-full px-2 py-0.5"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.09)",
                                    fontSize: "11px",
                                    color: "rgba(255,255,255,0.65)",
                                }}
                            >
                                {payer.emoji} {payer.name}
                            </span>
                        )}
                    </div>

                    <div className="text-right shrink-0">
                        <p style={{ fontSize: "16px", fontWeight: "800", color: accent, fontVariantNumeric: "tabular-nums" }}>
                            +₹{card.amount.toLocaleString("en-IN")}
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                            {fmtTime(card.time)}
                        </p>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ ...springs.snappy, delay: 0.4 }}
                            className="inline-block mt-1 rounded-full px-2 py-0.5"
                            style={{
                                fontSize: "10px",
                                fontWeight: "600",
                                background: "rgba(0,214,122,0.14)",
                                color: "#00D67A",
                                border: "1px solid rgba(0,214,122,0.22)",
                            }}
                        >
                            ✓ Completed
                        </motion.span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}