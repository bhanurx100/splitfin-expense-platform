"use client"

import React, { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/src/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type GlassVariant = "default" | "elevated" | "inset" | "highlight"
type GlassBorder = "none" | "subtle" | "default" | "strong" | "pink" | "purple" | "cyan" | "gradient"
type GlassGlow = "none" | "pink" | "purple" | "cyan"

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: GlassVariant
  border?: GlassBorder
  glow?: GlassGlow
  /** Glow color the card interpolates toward on hover (requires `interactive`). */
  hoverGlow?: Exclude<GlassGlow, "none">
  radius?: "md" | "lg" | "xl" | "2xl" | "3xl"
  padding?: "none" | "sm" | "md" | "lg"
  animated?: boolean
  pressable?: boolean
  strong?: boolean
  interactive?: boolean
  children?: React.ReactNode
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<GlassVariant, string> = {
  default: "bg-card",
  elevated: "bg-card",
  inset: "bg-card",
  highlight: "bg-card",
}

const borderStyles: Record<GlassBorder, string> = {
  none: "border-transparent",
  subtle: "border-border",
  default: "border-border",
  strong: "border-border-strong",
  pink: "border-[rgba(255,0,140,0.40)]",
  purple: "border-[rgba(124,58,237,0.40)]",
  cyan: "border-[rgba(0,255,208,0.35)]",
  gradient: "border-transparent", // handled via ::before pseudo (see wrapper)
}

const glowStyles: Record<GlassGlow, React.CSSProperties> = {
  none: {},
  pink: { boxShadow: "0 0 20px rgba(255, 0, 140, 0.08)" },
  purple: { boxShadow: "0 0 20px rgba(124, 58, 237, 0.08)" },
  cyan: { boxShadow: "0 0 20px rgba(0, 255, 208, 0.08)" },
}

/** Stronger glow the card interpolates toward while hovered. */
const hoverGlowStyles: Record<Exclude<GlassGlow, "none">, string> = {
  pink: "0 0 30px rgba(255, 0, 140, 0.12)",
  purple: "0 0 30px rgba(124, 58, 237, 0.12)",
  cyan: "0 0 30px rgba(0, 255, 208, 0.12)",
}

const radiusStyles: Record<NonNullable<GlassCardProps["radius"]>, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
}

const paddingStyles: Record<NonNullable<GlassCardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
}

// ─── Entrance Animation ───────────────────────────────────────────────────────

const entranceVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4 }
  },
}

const pressVariants = {
  tap: { scale: 0.975, transition: { duration: 0.1 } },
}

// ─── GlassCard ────────────────────────────────────────────────────────────────

/**
 * Base glassmorphism card.
 *
 * @example
 * <GlassCard border="purple" glow="purple" radius="2xl" padding="lg">
 *   content
 * </GlassCard>
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "default",
      border = "default",
      glow = "none",
      hoverGlow,
      radius = "xl",
      padding = "md",
      animated = false,
      pressable = false,
      strong = false,
      interactive = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isGradientBorder = border === "gradient"

    const baseClass = cn(
      // Layout
      "relative",
      // Glass (transparent)
      variantStyles[variant],
      // Strong variant (transparent with stronger border)
      strong && "border-border-strong",
      // Border
      "border",
      borderStyles[border],
      // Shape
      radiusStyles[radius],
      // Padding
      paddingStyles[padding],
      // Interactive affordance (motion handles the lift/glow interpolation)
      interactive && "cursor-pointer",
      className
    )

    const baseShadow = glowStyles[glow].boxShadow ?? "0 0 20px rgba(0,0,0,0.08)"

    const mergedStyle = {
      ...glowStyles[glow],
      ...style,
    }

    const motionProps = {
      ...(animated ? entranceVariants : {}),
      ...(pressable ? { whileTap: pressVariants.tap } : {}),
      ...(interactive
        ? {
          whileHover: {
            y: -3,
            scale: 1.005,
            boxShadow: hoverGlow ? hoverGlowStyles[hoverGlow] : baseShadow,
            borderColor: "rgba(255,255,255,0.22)",
          },
          whileTap: { scale: 0.99 },
          transition: { type: "spring" as const, stiffness: 300, damping: 26 },
        }
        : {}),
    }

    const content = (
      <>
        {/* Gradient border overlay (replaces 1px border) */}
        {isGradientBorder && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              padding: "1px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(255,0,140,0.5), rgba(0,255,208,0.4))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}
        {children}
      </>
    )

    return (
      <motion.div
        ref={ref}
        className={baseClass}
        style={mergedStyle}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.div>
    )
  }
)

GlassCard.displayName = "GlassCard"

// ─── GlassCardHeader ─────────────────────────────────────────────────────────

interface GlassCardHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function GlassCardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: GlassCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.07)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#F9FAFB] truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-[rgba(249,250,251,0.55)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── GlassCardDivider ────────────────────────────────────────────────────────

export function GlassCardDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full h-px bg-[rgba(255,255,255,0.07)]", className)}
    />
  )
}

// ─── GlassStatCard ───────────────────────────────────────────────────────────

interface GlassStatCardProps {
  label: string
  value: string
  sublabel?: string
  accent?: "pink" | "cyan" | "purple" | "warning"
  className?: string
}

const accentTextColors = {
  pink: "#FF4472",
  cyan: "#00D4AE",
  purple: "#9F6EF5",
  warning: "#FFB800",
}

export function GlassStatCard({
  label,
  value,
  sublabel,
  accent,
  className,
}: GlassStatCardProps) {
  return (
    <GlassCard variant="inset" border="subtle" radius="lg" padding="sm" className={className}>
      <p className="text-[11px] font-medium text-[rgba(249,250,251,0.5)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className="text-xl font-bold tabular-nums leading-tight"
        style={{ color: accent ? accentTextColors[accent] : "#F9FAFB" }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-[rgba(249,250,251,0.4)] mt-0.5">{sublabel}</p>
      )}
    </GlassCard>
  )
}