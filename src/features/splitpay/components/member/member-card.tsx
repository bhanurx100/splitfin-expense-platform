"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MoreVertical, Crown, ShieldCheck } from "lucide-react"
import { springCard, springs } from "@/src/features/splitpay/motions/motion"
import type { GroupPageMember } from "../../types"

interface MemberCardProps {
    member: GroupPageMember
    currencySymbol: string
    onActionPress?: (member: GroupPageMember) => void
}

export function MemberCard({ member, currencySymbol, onActionPress }: MemberCardProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    const isPositive = member.balance > 0
    const isZero = member.balance === 0

    const balanceColor = isZero
        ? "rgba(255,255,255,0.40)"
        : isPositive
            ? "#00D67A"
            : "#FF5470"

    const balanceLabel = member.isYou
        ? "Your net"
        : isZero
            ? "Settled"
            : isPositive
                ? "Owes you"
                : "You owe"

    const balanceText = isZero
        ? "✓ Even"
        : `${isPositive ? "+" : "-"}${currencySymbol}${Math.abs(member.balance).toLocaleString("en-IN")}`

    return (
        <motion.div
            variants={springCard}
            className="relative"
            whileHover={{ y: -2, transition: springs.gentle }}
        >
            <div
                className="flex items-center gap-3 p-4 rounded-[18px]"
                style={{
                    background: member.isYou ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.04)",
                    border: member.isYou
                        ? "1px solid rgba(139,92,246,0.22)"
                        : "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: member.isYou ? "0 0 16px rgba(139,92,246,0.10)" : "none",
                }}
            >
                {/* Emoji avatar */}
                <div
                    className="shrink-0 flex items-center justify-center rounded-full font-bold"
                    style={{
                        width: "46px",
                        height: "46px",
                        fontSize: "22px",
                        background: member.isYou ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.07)",
                        border: member.isYou ? "2px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.10)",
                    }}
                >
                    {member.emoji}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p
                            className="font-semibold truncate"
                            style={{ fontSize: "14px", color: "#F9FAFB" }}
                        >
                            {member.name}
                        </p>
                        {member.isYou && (
                            <span
                                className="rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    background: "rgba(139,92,246,0.18)",
                                    color: "#A78BFA",
                                    border: "1px solid rgba(139,92,246,0.28)",
                                }}
                            >
                                <Crown size={9} strokeWidth={2} /> You
                            </span>
                        )}
                        {member.role === "admin" && !member.isYou && (
                            <span
                                className="rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    background: "rgba(247,181,0,0.12)",
                                    color: "#F7B500",
                                    border: "1px solid rgba(247,181,0,0.22)",
                                }}
                            >
                                <ShieldCheck size={9} strokeWidth={2} /> Admin
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", marginTop: "2px" }}>
                        {balanceLabel}
                    </p>
                </div>

                {/* Balance */}
                <div className="text-right shrink-0 mr-1">
                    <p
                        style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: balanceColor,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {balanceText}
                    </p>
                </div>

                {/* Three-dot menu button */}
                <motion.button
                    onClick={() => { setMenuOpen((v) => !v); onActionPress?.(member) }}
                    aria-label={`Actions for ${member.name}`}
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{
                        width: "30px",
                        height: "30px",
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.38)",
                        cursor: "pointer",
                    }}
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ color: "#F9FAFB", background: "rgba(255,255,255,0.07)" }}
                    transition={springs.snappy}
                >
                    <MoreVertical size={16} strokeWidth={2} />
                </motion.button>
            </div>
        </motion.div>
    )
}