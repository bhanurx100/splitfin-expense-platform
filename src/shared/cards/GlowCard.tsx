"use client";

/**
 * shared/cards/GlowCard.tsx
 *
 * Hero-grade gradient card with animated mesh background.
 * Intended for: balance hero, group settlement banners, feature spotlights.
 * All content is passed as children — fully composable.
 *
 * Usage:
 *   // Preset themes:
 *   <GlowCard theme="violet">
 *     <p className="text-white/60 text-xs">Net Balance</p>
 *     <p className="text-white text-3xl font-bold">₹1,24,500</p>
 *   </GlowCard>
 *
 *   // Custom gradient:
 *   <GlowCard gradient="linear-gradient(135deg,#1e1b4b,#4338ca,#7c3aed)">
 *     {children}
 *   </GlowCard>
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

// ── Theme presets ─────────────────────────────────────────────────────────────

export type GlowTheme =
  | "violet"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight"
  | "rose"
  | "aurora";

const THEMES: Record<GlowTheme, { gradient: string; blob1: string; blob2: string; shadow: string }> = {
  violet: {
    gradient: "linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #6d28d9 100%)",
    blob1: "rgba(167,139,250,0.25)",
    blob2: "rgba(236,72,153,0.15)",
    shadow: "0 16px 48px rgba(109,40,217,0.40)",
  },
  ocean: {
    gradient: "linear-gradient(145deg, #0c1445 0%, #0f3460 40%, #1a5276 70%, #0e7490 100%)",
    blob1: "rgba(56,189,248,0.22)",
    blob2: "rgba(99,102,241,0.15)",
    shadow: "0 16px 48px rgba(14,116,144,0.38)",
  },
  sunset: {
    gradient: "linear-gradient(145deg, #431407 0%, #7c2d12 35%, #c2410c 65%, #ea580c 100%)",
    blob1: "rgba(251,146,60,0.25)",
    blob2: "rgba(236,72,153,0.18)",
    shadow: "0 16px 48px rgba(234,88,12,0.40)",
  },
  forest: {
    gradient: "linear-gradient(145deg, #052e16 0%, #064e3b 40%, #047857 70%, #059669 100%)",
    blob1: "rgba(52,211,153,0.22)",
    blob2: "rgba(99,102,241,0.12)",
    shadow: "0 16px 48px rgba(5,150,105,0.38)",
  },
  midnight: {
    gradient: "linear-gradient(145deg, #020617 0%, #0f172a 40%, #1e293b 70%, #334155 100%)",
    blob1: "rgba(148,163,184,0.12)",
    blob2: "rgba(99,102,241,0.10)",
    shadow: "0 16px 48px rgba(0,0,0,0.60)",
  },
  rose: {
    gradient: "linear-gradient(145deg, #4c0519 0%, #881337 40%, #be123c 70%, #e11d48 100%)",
    blob1: "rgba(251,113,133,0.22)",
    blob2: "rgba(245,158,11,0.14)",
    shadow: "0 16px 48px rgba(225,29,72,0.40)",
  },
  aurora: {
    gradient: "linear-gradient(145deg, #0d1117 0%, #1a0533 30%, #0c1a3d 60%, #003d2b 100%)",
    blob1: "rgba(139,92,246,0.28)",
    blob2: "rgba(16,185,129,0.20)",
    shadow: "0 16px 48px rgba(139,92,246,0.30)",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GlowCardProps {
  children: React.ReactNode;
  theme?: GlowTheme;
  /** Override gradient entirely — skips theme */
  gradient?: string;
  /** Override box shadow */
  shadow?: string;
  /** Disable the animated mesh blobs */
  noBlobs?: boolean;
  /** Disable entry animation */
  noAnimate?: boolean;
  className?: string;
  onClick?: () => void;
}

// ── Animated mesh blobs ────────────────────────────────────────────────────────

function MeshBlobs({ blob1, blob2 }: { blob1: string; blob2: string }) {
  return (
    <>
      {/* Top-right blob */}
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl"
        style={{ background: blob1 }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bottom-left blob */}
      <motion.div
        className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full blur-3xl"
        style={{ background: blob2 }}
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />
      {/* Top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GlowCard({
  children,
  theme = "violet",
  gradient,
  shadow,
  noBlobs = false,
  noAnimate = false,
  className,
  onClick,
}: GlowCardProps) {
  const t = THEMES[theme];
  const resolvedGradient = gradient ?? t.gradient;
  const resolvedShadow = shadow ?? t.shadow;

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial={noAnimate ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={noAnimate ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={onClick ? { scale: 1.015, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        onClick && "cursor-pointer",
        className,
      )}
      style={{
        background: resolvedGradient,
        boxShadow: resolvedShadow,
        // Fallback border — looks crisp on OLED
        outline: "1px solid rgba(255,255,255,0.08)",
        outlineOffset: "-1px",
      }}
    >
      {!noBlobs && <MeshBlobs blob1={t.blob1} blob2={t.blob2} />}

      {/* Content layer — sits above blobs */}
      <div className="relative z-10">{children}</div>
    </Wrapper>
  );
}