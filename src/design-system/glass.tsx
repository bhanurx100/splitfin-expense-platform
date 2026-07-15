"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { auroraFadeUp, auroraPress } from "./motion";

type GlassTone = "default" | "strong" | "soft";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  tone?: GlassTone;
  padding?: "none" | "sm" | "md" | "lg";
  glow?: "none" | "violet" | "cyan";
  interactive?: boolean;
}

const tones: Record<GlassTone, string> = {
  default: "bg-[var(--aurora-glass)]",
  strong: "bg-[var(--aurora-glass-strong)]",
  soft: "bg-[var(--aurora-gradient-soft)]",
};

const padding = { none: "p-0", sm: "p-3", md: "p-4", lg: "p-6" };
const glows = { none: "", violet: "shadow-[var(--aurora-glow-violet)]", cyan: "shadow-[var(--aurora-glow-cyan)]" };

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { tone = "default", padding: paddingSize = "md", glow = "none", interactive = false, className, children, ...props }, ref,
) {
  return (
    <motion.div
      ref={ref}
      className={cn("aurora-motion relative rounded-[var(--aurora-radius-card)] border border-[var(--aurora-glass-border)] backdrop-blur-2xl", tones[tone], padding[paddingSize], glows[glow], interactive && "transition-transform hover:-translate-y-0.5", className)}
      {...(interactive ? { whileTap: auroraPress } : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <GlassCard tone="strong" padding="lg" className={cn("rounded-[var(--aurora-radius-panel)]", className)}>{children}</GlassCard>;
}

export function AuroraReveal({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial="hidden" animate="visible" variants={auroraFadeUp}>{children}</motion.div>;
}
