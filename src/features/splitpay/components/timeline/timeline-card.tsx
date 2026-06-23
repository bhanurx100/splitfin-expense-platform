"use client"

import { motion } from "framer-motion"
import { Edit2, Trash2, CheckCircle } from "lucide-react"
import { staggerItem, springs } from "@/src/features/splitpay/motions/motion"
import type { TimelineCard as TimelineCardData } from "../../types"

// ─── Card accent config per type ─────────────────────────────────────────────

const TYPE_CONFIG = {
    expense_created: {
        accent: "#FF0A7A",
        bgMuted: "rgba(255,10,122,0.06)",
        border: "rgba(255,10,122,0.18)",
        label: null,
        Icon: null,
    },
    expense_edited: {
        accent: "#8B5CF6",
        bgMuted: "rgba(139,92,246,0.07)",
        border: "rgba(139,92,246,0.20)",
        label: "Edited",
        Icon: Edit2,
    },
    expense_deleted: {
        accent: "#FF5470",
        bgMuted: "rgba(255,84,112,0.07)",
        border: "rgba(255,84,112,0.20)",
        label: "Deleted",
        Icon: Trash2,
    },
    settlement: {
        accent: "#00D67A",
        bgMuted: "rgba(0,214,122,0.07)",
        border: "rgba(0,214,122,0.22)",
        label: "Settlement",
        Icon: CheckCircle,
    },
    payment_detected: {
        accent: "#00E5C3",
        bgMuted: "rgba(0,229,195,0.07)",
        border: "rgba(0,229,195,0.22)",
        label: "Auto-detected",
        Icon: CheckCircle,
    },
    payment_manual: {
        accent: "#00D67A",
        bgMuted: "rgba(0,214,122,0.06)",
        border: "rgba(0,214,122,0.18)",
        label: "Manual payment",
        Icon: CheckCircle,
    },
    payment_pending: {
        accent: "#F7B500",
        bgMuted: "rgba(247,181,0,0.07)",
        border: "rgba(247,181,0,0.20)",
        label: "Pending",
        Icon: null,
    },
} as const

function fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    }).replace(/\s/, " ").toUpperCase()
}

function fmtAmount(n: number): string {
    return "₹" + Math.abs(n).toLocaleString("en-IN")
}

// ─── Payer avatars ────────────────────────────────────────────────────────────

function PayerAvatars({ payers }: { payers: TimelineCardData["payers"] }) {
    const shown = payers.slice(0, 2)
    const overflow = payers.length - 2

    return (
        <div className="flex items-center gap-1 mt-2">
            {shown.map((p) => (
                <span
                    key={p.id}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.75)",
                    }}
                >
                    <span style={{ fontSize: "12px" }}>{p.emoji}</span>
                    <span>{p.name}</span>
                </span>
            ))}
            {overflow > 0 && (
                <span
                    style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.40)",
                        paddingLeft: "4px",
                    }}
                >
                    +{overflow}
                </span>
            )}
        </div>
    )
}

// ─── TimelineCard ─────────────────────────────────────────────────────────────

interface TimelineCardProps {
    card: TimelineCardData
    isLast?: boolean
}

export function TimelineCard({ card, isLast }: TimelineCardProps) {
    const cfg = TYPE_CONFIG[card.type]
    const showDeleted = card.type === "expense_deleted"

    return (
        <motion.div
            variants={staggerItem}
            className="relative flex gap-3"
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
        >
            {/* Vertical connector line */}
            {!isLast && (
                <div
                    className="absolute left-[19px] top-[44px]"
                    style={{
                        width: "2px",
                        bottom: "-12px",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
                    }}
                />
            )}

            {/* Category / type icon orb */}
            <div
                className="shrink-0 flex items-center justify-center rounded-full z-10"
                style={{
                    width: "40px",
                    height: "40px",
                    marginTop: "2px",
                    background: cfg.bgMuted,
                    border: `1px solid ${cfg.border}`,
                    boxShadow: `0 0 12px ${cfg.accent}20`,
                    fontSize: card.category ? "18px" : "14px",
                }}
            >
                {card.category ? (
                    card.category
                ) : cfg.Icon ? (
                    <cfg.Icon size={16} style={{ color: cfg.accent }} />
                ) : (
                    "💳"
                )}
            </div>

            {/* Card body */}
            <motion.div
                className="flex-1 mb-3 rounded-[18px] overflow-hidden"
                style={{
                    background: showDeleted ? "rgba(255,84,112,0.05)" : cfg.bgMuted,
                    border: `1px solid ${cfg.border}`,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    opacity: showDeleted ? 0.72 : 1,
                }}
                whileHover={{ scale: 1.008, boxShadow: `0 4px 24px ${cfg.accent}18` }}
                whileTap={{ scale: 0.985 }}
                transition={springs.gentle}
            >
                {/* Accent stripe */}
                <div
                    style={{
                        height: "2.5px",
                        background: `linear-gradient(90deg, ${cfg.accent}, transparent)`,
                    }}
                />

                <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                        {/* Left: title + subtitle */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p
                                    className="font-semibold truncate"
                                    style={{
                                        fontSize: "14px",
                                        color: showDeleted ? "rgba(255,255,255,0.50)" : "#F9FAFB",
                                        textDecoration: showDeleted ? "line-through" : "none",
                                    }}
                                >
                                    {card.title}
                                </p>
                                {cfg.label && (
                                    <span
                                        className="rounded-full px-1.5 py-0.5 shrink-0"
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            background: `${cfg.accent}18`,
                                            color: cfg.accent,
                                            border: `1px solid ${cfg.accent}30`,
                                        }}
                                    >
                                        {cfg.label}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", marginTop: "2px" }}>
                                {card.subtitle}
                            </p>

                            {/* Edited from */}
                            {card.editedFrom !== undefined && (
                                <p style={{ fontSize: "11px", color: "rgba(139,92,246,0.80)", marginTop: "3px" }}>
                                    Was ₹{card.editedFrom.toLocaleString("en-IN")}
                                </p>
                            )}

                            {/* Via for payment detected */}
                            {card.via && (
                                <p style={{ fontSize: "11px", color: "rgba(0,229,195,0.75)", marginTop: "3px" }}>
                                    via {card.via}{card.transactionId ? ` · ${card.transactionId}` : ""}
                                </p>
                            )}

                            {card.payers.length > 0 && <PayerAvatars payers={card.payers} />}
                        </div>

                        {/* Right: amount + time */}
                        <div className="text-right shrink-0">
                            <p
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "800",
                                    color: cfg.accent,
                                    fontVariantNumeric: "tabular-nums",
                                    textDecoration: showDeleted ? "line-through" : "none",
                                    opacity: showDeleted ? 0.55 : 1,
                                }}
                            >
                                {card.type === "settlement" || card.type === "payment_detected" || card.type === "payment_manual"
                                    ? "+" : ""}{fmtAmount(card.amount)}
                            </p>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                                {fmtTime(card.time)}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}