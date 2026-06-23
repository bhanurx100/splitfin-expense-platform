"use client"

import { useEffect, useState, useId } from "react"
import { motion } from "framer-motion"
import { animate } from "framer-motion"
import { fadeUp, breathingGlow } from "@/src/features/splitpay/motions/motion"
import type { GroupSummary } from "@/src/features/splitpay/types/group"

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCounter(target: number, delay = 0) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => {
            const c = animate(0, target, {
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (v) => setVal(Math.round(v)),
            })
            return () => c.stop()
        }, delay)
        return () => clearTimeout(t)
    }, [target, delay])
    return val
}

function fmt(sym: string, n: number) {
    return sym + Math.abs(n).toLocaleString("en-IN")
}

// ─── Wave background ──────────────────────────────────────────────────────────

function SummaryWave() {
    return (
        <svg
            viewBox="0 0 360 90"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-[90px] pointer-events-none"
            aria-hidden
        >
            <motion.path
                d="M0,45 C60,25 100,65 160,45 C220,25 280,65 360,40 L360,90 L0,90 Z"
                fill="rgba(255,10,122,0.09)"
                animate={{
                    d: [
                        "M0,45 C60,25 100,65 160,45 C220,25 280,65 360,40 L360,90 L0,90 Z",
                        "M0,50 C70,65 110,30 170,50 C230,68 290,32 360,48 L360,90 L0,90 Z",
                        "M0,45 C60,25 100,65 160,45 C220,25 280,65 360,40 L360,90 L0,90 Z",
                    ],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
                d="M0,60 C80,42 140,74 200,58 C260,42 310,70 360,55 L360,90 L0,90 Z"
                fill="rgba(139,92,246,0.07)"
                animate={{
                    d: [
                        "M0,60 C80,42 140,74 200,58 C260,42 310,70 360,55 L360,90 L0,90 Z",
                        "M0,54 C70,70 130,44 195,62 C262,78 312,50 360,60 L360,90 L0,90 Z",
                        "M0,60 C80,42 140,74 200,58 C260,42 310,70 360,55 L360,90 L0,90 Z",
                    ],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
        </svg>
    )
}

// ─── Balance Ring ─────────────────────────────────────────────────────────────

interface RingProps {
    youWillPay: number
    youWillReceive: number
    sym: string
}

function BalanceRing({ youWillPay, youWillReceive, sym }: RingProps) {
    const net = youWillReceive - youWillPay
    const isPos = net >= 0
    const ringColor = isPos ? "rgba(0,214,122,0.75)" : "rgba(255,84,112,0.75)"
    const glowColor = isPos ? "rgba(0,214,122,0.28)" : "rgba(255,84,112,0.28)"
    const animNet = useCounter(Math.abs(net), 500)

    const C = 2 * Math.PI * 52
    const pct = Math.min(Math.abs(net) / Math.max(youWillReceive, youWillPay, 1), 1)

    return (
        <motion.div
            className="relative flex items-center justify-center mx-auto"
            style={{ width: 126, height: 126 }}
            animate={breathingGlow.orbShadow.animate}
            transition={{ ...breathingGlow.orbShadow.transition, boxShadow: undefined }}
        >
            {/* Outer glow */}
            <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 32px ${glowColor}, 0 0 64px ${glowColor}` }}
            />
            {/* SVG ring */}
            <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" style={{ transform: "rotate(-90deg)" }} aria-hidden>
                <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={4.5} />
                <motion.circle
                    cx={60} cy={60} r={52}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - pct * 0.78) }}
                    transition={{ duration: 1.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ filter: `drop-shadow(0 0 5px ${ringColor})` }}
                />
            </svg>
            {/* Centre text */}
            <div className="relative z-10 flex flex-col items-center">
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Net Balance
                </p>
                <p
                    style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        color: isPos ? "#00D67A" : "#FF5470",
                        textShadow: `0 0 16px ${glowColor}`,
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: "1.1",
                    }}
                >
                    {isPos ? "+" : "-"}{sym}{animNet.toLocaleString("en-IN")}
                </p>
            </div>
        </motion.div>
    )
}

// ─── GroupSummaryCard ─────────────────────────────────────────────────────────

interface GroupSummaryCardProps {
    summary: GroupSummary
}

export function GroupSummaryCard({ summary }: GroupSummaryCardProps) {
    const { currencySymbol: sym } = summary
    const payAnim = useCounter(summary.youWillPay, 300)
    const receiveAnim = useCounter(summary.youWillReceive, 400)
    const totalAnim = useCounter(summary.totalExpenses, 200)
    const settledAnim = useCounter(summary.settled, 350)

    const lastSettled = summary.lastSettledAt
        ? new Date(summary.lastSettledAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        })
        : "Never"

    return (
        <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.08 }}
            className="mx-5"
        >
            {/* Gradient border wrapper */}
            <div
                className="rounded-[26px] p-[1px]"
                style={{ background: "linear-gradient(135deg,rgba(255,10,122,0.45),rgba(139,92,246,0.55),rgba(0,229,195,0.35))" }}
            >
                <div
                    className="relative overflow-hidden rounded-[25px]"
                    style={{
                        background: "rgba(10,6,24,0.94)",
                        backdropFilter: "blur(32px) saturate(160%)",
                        WebkitBackdropFilter: "blur(32px) saturate(160%)",
                    }}
                >
                    {/* Ambient glows */}
                    <div aria-hidden className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle,rgba(139,92,246,0.16),transparent 70%)" }} />
                    <div aria-hidden className="absolute -top-6 -right-6 w-36 h-36 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle,rgba(255,10,122,0.10),transparent 70%)" }} />

                    <SummaryWave />

                    <div className="relative z-10 p-5">
                        {/* You receive / pay pills */}
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="flex-1 rounded-[14px] p-3"
                                style={{ background: "rgba(0,214,122,0.08)", border: "1px solid rgba(0,214,122,0.15)" }}
                            >
                                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "3px" }}>
                                    You will receive
                                </p>
                                <p style={{
                                    fontSize: "22px", fontWeight: "900", color: "#00D67A",
                                    textShadow: "0 0 16px rgba(0,214,122,0.40)", fontVariantNumeric: "tabular-nums"
                                }}>
                                    {sym}{receiveAnim.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <div
                                className="flex-1 rounded-[14px] p-3"
                                style={{ background: "rgba(255,84,112,0.08)", border: "1px solid rgba(255,84,112,0.15)" }}
                            >
                                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "3px" }}>
                                    You will pay
                                </p>
                                <p style={{
                                    fontSize: "22px", fontWeight: "900", color: "#FF5470",
                                    textShadow: "0 0 16px rgba(255,84,112,0.40)", fontVariantNumeric: "tabular-nums"
                                }}>
                                    {sym}{payAnim.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        {/* Balance ring — centred */}
                        <BalanceRing
                            youWillPay={summary.youWillPay}
                            youWillReceive={summary.youWillReceive}
                            sym={sym}
                        />

                        {/* Divider */}
                        <div className="my-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Total expenses", value: sym + totalAnim.toLocaleString("en-IN") },
                                { label: "Settled", value: sym + settledAnim.toLocaleString("en-IN") },
                                { label: "Last settlement", value: lastSettled, small: true },
                            ].map((stat) => (
                                <div key={stat.label} className="flex flex-col">
                                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)", marginBottom: "3px" }}>
                                        {stat.label}
                                    </p>
                                    <p style={{
                                        fontSize: stat.small ? "11px" : "13px",
                                        fontWeight: "700",
                                        color: "#F9FAFB",
                                        fontVariantNumeric: "tabular-nums",
                                    }}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}