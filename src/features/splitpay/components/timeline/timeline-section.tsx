"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/src/features/splitpay/motions/motion"
import { TimelineCard } from "./timeline-card"
import { SettlementCard } from "./settlement-card"
import { PaymentDetectedCard } from "./payment-detected-card"
import type { TimelineCard as TimelineCardType } from "../../types"

type TimelineCardData = TimelineCardType

// ─── Date group label ─────────────────────────────────────────────────────────

const DATE_LABELS: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
}

// ─── Route card to correct component ─────────────────────────────────────────

function renderCard(card: TimelineCardData, isLast: boolean) {
    if (card.type === "settlement") {
        return <SettlementCard key={card.id} card={card} isLast={isLast} />
    }
    if (card.type === "payment_detected") {
        return <PaymentDetectedCard key={card.id} card={card} isLast={isLast} />
    }
    return <TimelineCard key={card.id} card={card} isLast={isLast} />
}

// ─── TimelineSection ─────────────────────────────────────────────────────────

interface TimelineSectionProps {
    cards: TimelineCardData[]
}

export function TimelineSection({ cards }: TimelineSectionProps) {
    // Group by dateGroup, preserve order: today → yesterday → earlier
    const groups = useMemo(() => {
        const ORDER = ["today", "yesterday", "earlier"] as const
        const map = new Map<string, TimelineCardData[]>()

        for (const card of cards) {
            const arr = map.get(card.dateGroup) ?? []
            arr.push(card)
            map.set(card.dateGroup, arr)
        }

        return ORDER.filter((g) => map.has(g)).map((g) => ({
            key: g,
            label: DATE_LABELS[g],
            cards: map.get(g)!,
        }))
    }, [cards])

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center py-16 text-center px-8">
                <span style={{ fontSize: "40px", marginBottom: "12px" }}>🌱</span>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "rgba(255,255,255,0.65)" }}>
                    No activity yet
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
                    Add an expense to get started
                </p>
            </div>
        )
    }

    return (
        <div className="px-5 pt-2 pb-6">
            {groups.map((group) => (
                <div key={group.key} className="mb-4">
                    {/* Date separator */}
                    <motion.div
                        variants={staggerItem}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div
                            style={{
                                height: "1px",
                                flex: 1,
                                background: "rgba(255,255,255,0.07)",
                            }}
                        />
                        <span
                            className="font-semibold"
                            style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.35)",
                                letterSpacing: "0.07em",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {group.label}
                        </span>
                        <div
                            style={{
                                height: "1px",
                                flex: 1,
                                background: "rgba(255,255,255,0.07)",
                            }}
                        />
                    </motion.div>

                    {/* Cards in stagger container */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-30px" }}
                        className="flex flex-col"
                    >
                        {group.cards.map((card, idx) =>
                            renderCard(card, idx === group.cards.length - 1 && group.key === "earlier")
                        )}
                    </motion.div>
                </div>
            ))}
        </div>
    )
}