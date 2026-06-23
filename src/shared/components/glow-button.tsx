"use client"

import React, { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/src/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type GlowColor    = "pink" | "purple" | "cyan" | "white"
type GlowSize     = "xs" | "sm" | "md" | "lg" | "xl"
type GlowVariant  = "outline" | "ghost" | "subtle"

interface GlowButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  color?:    GlowColor
  size?:     GlowSize
  variant?:  GlowVariant
  loading?:  boolean
  disabled?: boolean
  fullWidth?:boolean
  icon?:     React.ReactNode
  iconEnd?:  React.ReactNode
  iconOnly?: boolean
  children?: React.ReactNode
}

// ─── Color Maps ───────────────────────────────────────────────────────────────

const colorConfig: Record<GlowColor, {
  text:         string
  border:       string
  bg:           string
  bgHover:      string
  glow:         string
  glowHover:    string
}> = {
  pink: {
    text:      "#FF008C",
    border:    "rgba(255, 0, 140, 0.40)",
    bg:        "rgba(255, 0, 140, 0.08)",
    bgHover:   "rgba(255, 0, 140, 0.14)",
    glow:      "0 0 12px rgba(255, 0, 140, 0.20), 0 2px 8px rgba(0,0,0,0.3)",
    glowHover: "0 0 20px rgba(255, 0, 140, 0.35), 0 4px 12px rgba(0,0,0,0.4)",
  },
  purple: {
    text:      "#9F6EF5",
    border:    "rgba(124, 58, 237, 0.40)",
    bg:        "rgba(124, 58, 237, 0.08)",
    bgHover:   "rgba(124, 58, 237, 0.14)",
    glow:      "0 0 12px rgba(124, 58, 237, 0.20), 0 2px 8px rgba(0,0,0,0.3)",
    glowHover: "0 0 20px rgba(124, 58, 237, 0.35), 0 4px 12px rgba(0,0,0,0.4)",
  },
  cyan: {
    text:      "#00D4AE",
    border:    "rgba(0, 255, 208, 0.35)",
    bg:        "rgba(0, 255, 208, 0.06)",
    bgHover:   "rgba(0, 255, 208, 0.12)",
    glow:      "0 0 12px rgba(0, 255, 208, 0.16), 0 2px 8px rgba(0,0,0,0.3)",
    glowHover: "0 0 20px rgba(0, 255, 208, 0.30), 0 4px 12px rgba(0,0,0,0.4)",
  },
  white: {
    text:      "rgba(249, 250, 251, 0.90)",
    border:    "rgba(255, 255, 255, 0.18)",
    bg:        "rgba(255, 255, 255, 0.05)",
    bgHover:   "rgba(255, 255, 255, 0.09)",
    glow:      "0 0 8px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)",
    glowHover: "0 0 16px rgba(255,255,255,0.14), 0 4px 12px rgba(0,0,0,0.4)",
  },
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizes: Record<GlowSize, {
  height:   string
  px:       string
  text:     string
  radius:   string
  icon:     string
  iconOnly: string
}> = {
  xs: { height: "32px", px: "px-3",   text: "text-xs",   radius: "rounded-[8px]",  icon: "w-3.5 h-3.5", iconOnly: "w-8 h-8 p-0" },
  sm: { height: "36px", px: "px-3.5", text: "text-sm",   radius: "rounded-[9px]",  icon: "w-4 h-4",     iconOnly: "w-9 h-9 p-0" },
  md: { height: "44px", px: "px-4",   text: "text-sm",   radius: "rounded-[11px]", icon: "w-4 h-4",     iconOnly: "w-11 h-11 p-0" },
  lg: { height: "52px", px: "px-5",   text: "text-base", radius: "rounded-[13px]", icon: "w-5 h-5",     iconOnly: "w-13 h-13 p-0" },
  xl: { height: "58px", px: "px-6",   text: "text-base", radius: "rounded-[14px]", icon: "w-5 h-5",     iconOnly: "w-14 h-14 p-0" },
}

// ─── GlowButton ──────────────────────────────────────────────────────────────

/**
 * Glowing secondary / outline button.
 * Used for secondary actions, add buttons, and icon-only actions.
 *
 * @example
 * // Settle up button
 * <GlowButton color="cyan" size="lg" fullWidth>Settle Up</GlowButton>
 *
 * // Add icon button
 * <GlowButton color="purple" iconOnly icon={<Plus />} size="sm" />
 *
 * // Ghost — no border
 * <GlowButton color="white" variant="ghost">Cancel</GlowButton>
 */
export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      color     = "purple",
      size      = "md",
      variant   = "outline",
      loading   = false,
      disabled  = false,
      fullWidth = false,
      icon,
      iconEnd,
      iconOnly  = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const c = colorConfig[color]
    const s = sizes[size]

    const borderStyle = variant === "ghost" ? "transparent" : c.border
    const bgStyle     = variant === "subtle" ? c.bg : variant === "ghost" ? "transparent" : c.bg

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 overflow-hidden",
          "font-semibold select-none cursor-pointer",
          "transition-colors duration-150",
          // Size
          iconOnly ? s.iconOnly : cn(s.px, "h-auto"),
          s.text,
          s.radius,
          // Full width
          fullWidth && "w-full",
          // Disabled
          isDisabled && "opacity-40 cursor-not-allowed",
          className
        )}
        style={{
          height:      iconOnly ? undefined : s.height,
          color:       c.text,
          background:  bgStyle,
          border:      `1px solid ${borderStyle}`,
          boxShadow:   isDisabled ? "none" : c.glow,
          ...style,
        }}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        whileHover={isDisabled ? undefined : {
          scale:     1.02,
          boxShadow: c.glowHover,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        {...props}
      >
        {loading ? (
          <LoadingDots color={c.text} />
        ) : (
          <>
            {icon && (
              <span className={cn(s.icon, "flex items-center justify-center shrink-0")}>
                {icon}
              </span>
            )}
            {!iconOnly && children}
            {iconEnd && (
              <span className={cn(s.icon, "flex items-center justify-center shrink-0")}>
                {iconEnd}
              </span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

GlowButton.displayName = "GlowButton"

// ─── Loading Dots ─────────────────────────────────────────────────────────────

function LoadingDots({ color }: { color: string }) {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration:   0.9,
            repeat:     Infinity,
            delay:      i * 0.15,
            ease:       "easeInOut",
          }}
        />
      ))}
    </span>
  )
}

// ─── IconButton (convenience wrapper) ────────────────────────────────────────

interface IconButtonProps extends Omit<GlowButtonProps, "iconOnly" | "children"> {
  label: string  // accessible label (aria-label)
}

/**
 * Circular icon-only button with glow.
 *
 * @example
 * <IconButton label="Add member" color="purple" icon={<Plus />} />
 */
export function IconButton({ label, icon, ...props }: IconButtonProps) {
  return (
    <GlowButton
      aria-label={label}
      icon={icon}
      iconOnly
      {...props}
    />
  )
}