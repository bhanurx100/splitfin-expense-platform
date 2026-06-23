"use client";

/**
 * shared/cards/MetricCard.tsx
 *
 * Primary KPI card for financial metrics.
 * Shows a headline value, label, trend delta, and optional sparkline strip.
 *
 * Usage:
 *   <MetricCard
 *     label="Total Balance"
 *     value="₹1,24,500"
 *     delta={{ value: "+12.4%", direction: "up" }}
 *     accent="violet"
 *     icon={<Wallet className="h-4 w-4" />}
 *   />
 */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/src/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricAccent = "violet" | "pink" | "blue" | "emerald" | "amber" | "rose";

export type MetricDelta = {
  value: string;      // e.g. "+12.4%"
  direction: "up" | "down" | "neutral";
};

export type SparkPoint = { v: number };

export interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  delta?: MetricDelta;
  accent?: MetricAccent;
  icon?: React.ReactNode;
  /** Optional mini sparkline — array of { v: number } values */
  spark?: SparkPoint[];
  loading?: boolean;
  className?: string;
  /** Animate value in on mount */
  animate?: boolean;
}

// ── Accent palette ─────────────────────────────────────────────────────────────

const ACCENTS: Record<MetricAccent, {
  glow: string;
  border: string;
  iconBg: string;
  iconColor: string;
  sparkColor: string;
  badge: string;
}> = {
  violet: {
    glow: "rgba(139,92,246,0.18)",
    border: "rgba(139,92,246,0.30)",
    iconBg: "rgba(139,92,246,0.12)",
    iconColor: "#a78bfa",
    sparkColor: "#8b5cf6",
    badge: "rgba(139,92,246,0.14)",
  },
  pink: {
    glow: "rgba(236,72,153,0.16)",
    border: "rgba(236,72,153,0.28)",
    iconBg: "rgba(236,72,153,0.10)",
    iconColor: "#f472b6",
    sparkColor: "#ec4899",
    badge: "rgba(236,72,153,0.12)",
  },
  blue: {
    glow: "rgba(59,130,246,0.16)",
    border: "rgba(59,130,246,0.28)",
    iconBg: "rgba(59,130,246,0.10)",
    iconColor: "#60a5fa",
    sparkColor: "#3b82f6",
    badge: "rgba(59,130,246,0.12)",
  },
  emerald: {
    glow: "rgba(16,185,129,0.14)",
    border: "rgba(16,185,129,0.26)",
    iconBg: "rgba(16,185,129,0.09)",
    iconColor: "#34d399",
    sparkColor: "#10b981",
    badge: "rgba(16,185,129,0.11)",
  },
  amber: {
    glow: "rgba(245,158,11,0.14)",
    border: "rgba(245,158,11,0.26)",
    iconBg: "rgba(245,158,11,0.09)",
    iconColor: "#fbbf24",
    sparkColor: "#f59e0b",
    badge: "rgba(245,158,11,0.11)",
  },
  rose: {
    glow: "rgba(244,63,94,0.14)",
    border: "rgba(244,63,94,0.26)",
    iconBg: "rgba(244,63,94,0.09)",
    iconColor: "#fb7185",
    sparkColor: "#f43f5e",
    badge: "rgba(244,63,94,0.11)",
  },
};

// ── Mini sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ points, color }: { points: SparkPoint[]; color: string }) {
  if (points.length < 2) return null;
  const w = 80;
  const h = 28;
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const xs = vals.map((_, i) => (i / (vals.length - 1)) * w);
  const ys = vals.map((v) => h - ((v - min) / range) * (h - 4) - 2);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5", className)}
      style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-20 animate-pulse rounded-full" style={{ background: "var(--surface-sunken)" }} />
        <div className="h-7 w-7 animate-pulse rounded-xl" style={{ background: "var(--surface-sunken)" }} />
      </div>
      <div className="mb-2 h-7 w-32 animate-pulse rounded-lg" style={{ background: "var(--surface-sunken)" }} />
      <div className="h-3 w-16 animate-pulse rounded-full" style={{ background: "var(--surface-sunken)" }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  sublabel,
  delta,
  accent = "violet",
  icon,
  spark,
  loading = false,
  className,
  animate = true,
}: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const a = ACCENTS[accent];

  if (loading) return <MetricCardSkeleton className={className} />;

  const DeltaIcon =
    delta?.direction === "up"
      ? TrendingUp
      : delta?.direction === "down"
        ? TrendingDown
        : Minus;

  const deltaColor =
    delta?.direction === "up"
      ? "#34d399"
      : delta?.direction === "down"
        ? "#f87171"
        : "var(--text-muted)";

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative overflow-hidden rounded-2xl p-5 transition-all duration-300", className)}
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${a.border}`,
        boxShadow: `0 0 0 0 ${a.glow}, var(--shadow-card)`,
      }}
      whileHover={{
        boxShadow: `0 0 28px 0 ${a.glow}, var(--shadow-md)`,
        borderColor: a.border,
        y: -2,
      }}
    >
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: a.glow, opacity: 0.5 }}
      />

      {/* Top row */}
      <div className="relative mb-3 flex items-start justify-between">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{ background: a.iconBg, color: a.iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <motion.p
        className="relative mb-1 font-bold tabular-nums tracking-tight"
        style={{
          color: "var(--text-primary)",
          fontSize: "clamp(1.375rem, 4vw, 1.625rem)",
          lineHeight: 1.1,
        }}
        initial={animate ? { opacity: 0, scale: 0.92 } : false}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.p>

      {/* Sublabel + delta row */}
      <div className="relative flex items-center gap-2">
        {sublabel && (
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {sublabel}
          </span>
        )}
        {delta && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: a.badge, color: deltaColor }}
          >
            <DeltaIcon className="h-3 w-3" />
            {delta.value}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {spark && spark.length > 1 && (
        <div className="relative mt-3 flex justify-end opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkline points={spark} color={a.sparkColor} />
        </div>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${a.sparkColor}, transparent)` }}
      />
    </motion.div>
  );
}