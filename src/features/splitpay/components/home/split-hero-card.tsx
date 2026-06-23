"use client"

import { useEffect, useState } from "react"
import { motion, animate } from "framer-motion"
import type { HomeBalance } from "../../types"

// ─── Animated counter ─────────────────────────────────────────────────────────

function useAnimatedNumber(target: number, delay: number = 0) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(0, target, {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      })
      return () => controls.stop()
    }, delay)
    return () => clearTimeout(timer)
  }, [target, delay])

  return display
}

function formatINR(n: number): string {
  return "₹" + Math.abs(n).toLocaleString("en-IN")
}

// ─── Wave SVG ─────────────────────────────────────────────────────────────────

function HeroWave() {
  return (
    <motion.svg
      viewBox="0 0 300 80"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      {/* Wave 1 — pink/magenta */}
      <motion.path
        d="M0,40 C40,20 80,60 120,40 C160,20 200,60 240,40 C270,26 290,44 300,38 L300,80 L0,80 Z"
        fill="rgba(255,0,140,0.13)"
        animate={{
          d: [
            "M0,40 C40,20 80,60 120,40 C160,20 200,60 240,40 C270,26 290,44 300,38 L300,80 L0,80 Z",
            "M0,44 C50,58 90,24 130,44 C170,62 210,28 250,46 C275,56 292,36 300,42 L300,80 L0,80 Z",
            "M0,40 C40,20 80,60 120,40 C160,20 200,60 240,40 C270,26 290,44 300,38 L300,80 L0,80 Z",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Wave 2 — purple */}
      <motion.path
        d="M0,52 C60,34 100,68 150,52 C200,36 240,66 300,48 L300,80 L0,80 Z"
        fill="rgba(124,58,237,0.10)"
        animate={{
          d: [
            "M0,52 C60,34 100,68 150,52 C200,36 240,66 300,48 L300,80 L0,80 Z",
            "M0,46 C50,62 100,36 155,50 C210,64 255,38 300,52 L300,80 L0,80 Z",
            "M0,52 C60,34 100,68 150,52 C200,36 240,66 300,48 L300,80 L0,80 Z",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </motion.svg>
  )
}

// ─── Balance Ring ─────────────────────────────────────────────────────────────

interface BalanceRingProps {
  net: number
  animated: number   // animated counter value
}

function BalanceRing({ net, animated }: BalanceRingProps) {
  const isPositive = net >= 0
  const ringColor = isPositive
    ? "rgba(0,255,208,0.70)"
    : "rgba(255,68,114,0.70)"
  const glowColor = isPositive
    ? "rgba(0,255,208,0.30)"
    : "rgba(255,68,114,0.30)"

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: "120px", height: "120px" }}
      animate={{ scale: [1, 1.022, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 28px ${glowColor}, 0 0 56px ${glowColor}`,
          borderRadius: "50%",
        }}
      />

      {/* SVG ring */}
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 w-full h-full -rotate-90"
        aria-hidden
      >
        {/* Track */}
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="4"
        />
        {/* Progress — animated stroke */}
        <motion.circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 52}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.72) }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
        />
      </svg>

      {/* Inner content */}
      <div className="relative flex flex-col items-center justify-center z-10">
        <p
          className="text-[10px] font-medium"
          style={{ color: "rgba(249,250,251,0.50)", letterSpacing: "0.04em" }}
        >
          Net Balance
        </p>
        <p
          className="text-[19px] font-black tabular-nums leading-tight"
          style={{
            color: isPositive ? "#00D4AE" : "#FF6B8F",
            textShadow: isPositive
              ? "0 0 14px rgba(0,212,174,0.50)"
              : "0 0 14px rgba(255,107,143,0.50)",
          }}
        >
          {isPositive ? "+" : "-"}{formatINR(animated)}
        </p>
      </div>
    </motion.div>
  )
}

// ─── SplitHeroCard ────────────────────────────────────────────────────────────

interface SplitHeroCardProps {
  balance: HomeBalance
}

export function SplitHeroCard({ balance }: SplitHeroCardProps) {
  const payAnim = useAnimatedNumber(balance.youWillPay, 300)
  const receiveAnim = useAnimatedNumber(balance.youWillReceive, 400)
  const netAnim = useAnimatedNumber(Math.abs(balance.net), 500)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="mx-5"
    >
      {/* Gradient border wrapper */}
      <div
        className="relative rounded-[22px] p-[1px]"
        style={{
          background: "linear-gradient(135deg, rgba(255,0,140,0.5) 0%, rgba(124,58,237,0.6) 50%, rgba(0,255,208,0.4) 100%)",
        }}
      >
        {/* Animated border shimmer */}
        <motion.div
          className="absolute inset-0 rounded-[22px] opacity-60"
          style={{
            background: "linear-gradient(135deg, rgba(255,0,140,0.4) 0%, rgba(124,58,237,0.5) 50%, rgba(0,255,208,0.35) 100%)",
            backgroundSize: "200% 200%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Card body */}
        <div
          className="relative overflow-hidden rounded-[21px]"
          style={{
            background: "rgba(10, 5, 20, 0.92)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
          }}
        >
          {/* Background wave — bottom half */}
          <div className="absolute bottom-0 left-0 right-0 h-[80px]">
            <HeroWave />
          </div>

          {/* Ambient purple glow top-left */}
          <div
            aria-hidden
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }}
          />
          {/* Ambient pink glow top-right */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,0,140,0.12), transparent 70%)" }}
          />

          <div className="relative z-10 p-5">
            {/* Overview label */}
            <p
              className="text-[11px] font-semibold mb-4"
              style={{
                color: "rgba(249,250,251,0.45)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Overview
            </p>

            {/* Pay / Receive row */}
            <div className="flex items-start justify-between mb-5">
              {/* You will pay */}
              <div>
                <p
                  className="text-[11px] font-medium mb-0.5"
                  style={{ color: "rgba(249,250,251,0.50)" }}
                >
                  You will pay
                </p>
                <p
                  className="text-[26px] font-black tabular-nums leading-none"
                  style={{
                    color: "#FF6B8F",
                    textShadow: "0 0 18px rgba(255,68,114,0.40)",
                  }}
                >
                  {formatINR(payAnim)}
                </p>
              </div>

              {/* Vertical divider */}
              <div
                className="self-stretch w-[1px] mx-4"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />

              {/* You will receive */}
              <div className="text-right">
                <p
                  className="text-[11px] font-medium mb-0.5"
                  style={{ color: "rgba(249,250,251,0.50)" }}
                >
                  You will receive
                </p>
                <p
                  className="text-[26px] font-black tabular-nums leading-none"
                  style={{
                    color: "#00D4AE",
                    textShadow: "0 0 18px rgba(0,212,174,0.40)",
                  }}
                >
                  {formatINR(receiveAnim)}
                </p>
              </div>
            </div>

            {/* Balance ring — centered */}
            <div className="flex justify-center pb-2">
              <BalanceRing net={balance.net} animated={netAnim} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}