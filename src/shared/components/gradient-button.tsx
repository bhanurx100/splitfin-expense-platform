"use client"

import React, { forwardRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/src/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type GradientVariant = "pink" | "purple" | "cyan" | "pink-purple" | "purple-cyan" | "full"
type ButtonSize      = "xs" | "sm" | "md" | "lg" | "xl"

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?:  GradientVariant
  size?:     ButtonSize
  loading?:  boolean
  disabled?: boolean
  fullWidth?:boolean
  icon?:     React.ReactNode
  iconEnd?:  React.ReactNode
  children?: React.ReactNode
}

// ─── Gradient Maps ────────────────────────────────────────────────────────────

const gradients: Record<GradientVariant, string> = {
  "pink":        "linear-gradient(135deg, #FF008C, #FF3D7F)",
  "purple":      "linear-gradient(135deg, #7C3AED, #9F6EF5)",
  "cyan":        "linear-gradient(135deg, #00D4AE, #00FFD0)",
  "pink-purple": "linear-gradient(135deg, #FF008C 0%, #7C3AED 100%)",
  "purple-cyan": "linear-gradient(135deg, #7C3AED 0%, #00D4AE 100%)",
  "full":        "linear-gradient(135deg, #FF008C 0%, #7C3AED 50%, #00D4AE 100%)",
}

const glows: Record<GradientVariant, string> = {
  "pink":        "0 4px 20px rgba(255, 0, 140, 0.45), 0 2px 8px rgba(0,0,0,0.4)",
  "purple":      "0 4px 20px rgba(124, 58, 237, 0.45), 0 2px 8px rgba(0,0,0,0.4)",
  "cyan":        "0 4px 20px rgba(0, 212, 174, 0.40), 0 2px 8px rgba(0,0,0,0.4)",
  "pink-purple": "0 4px 24px rgba(180, 20, 160, 0.45), 0 2px 8px rgba(0,0,0,0.4)",
  "purple-cyan": "0 4px 24px rgba(62, 150, 160, 0.40), 0 2px 8px rgba(0,0,0,0.4)",
  "full":        "0 4px 28px rgba(180, 20, 160, 0.45), 0 2px 8px rgba(0,0,0,0.4)",
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizes: Record<ButtonSize, { height: string; px: string; text: string; radius: string; iconSize: string }> = {
  xs: { height: "32px", px: "px-3",   text: "text-xs",    radius: "rounded-[8px]",  iconSize: "w-3.5 h-3.5" },
  sm: { height: "38px", px: "px-4",   text: "text-sm",    radius: "rounded-[10px]", iconSize: "w-4 h-4" },
  md: { height: "48px", px: "px-5",   text: "text-sm",    radius: "rounded-[12px]", iconSize: "w-4.5 h-4.5" },
  lg: { height: "54px", px: "px-6",   text: "text-base",  radius: "rounded-[14px]", iconSize: "w-5 h-5" },
  xl: { height: "60px", px: "px-8",   text: "text-base",  radius: "rounded-[16px]", iconSize: "w-5 h-5" },
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

// ─── GradientButton ───────────────────────────────────────────────────────────

/**
 * Primary gradient CTA button with glow effects.
 *
 * @example
 * <GradientButton variant="pink-purple" size="lg" fullWidth>
 *   Create Group
 * </GradientButton>
 */
export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      variant   = "pink-purple",
      size      = "md",
      loading   = false,
      disabled  = false,
      fullWidth = false,
      icon,
      iconEnd,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const s = sizes[size]

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2 overflow-hidden",
          "font-semibold text-white select-none cursor-pointer",
          "transition-opacity",
          // Size
          s.px,
          s.text,
          s.radius,
          // Full width
          fullWidth && "w-full",
          // Disabled
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        style={{
          height: s.height,
          background: gradients[variant],
          boxShadow: isDisabled ? "none" : glows[variant],
          ...style,
        }}
        // Press animation
        whileTap={isDisabled ? undefined : { scale: 0.965 }}
        whileHover={isDisabled ? undefined : { scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        {...props}
      >
        {/* Animated shine overlay */}
        {!isDisabled && (
          <motion.div
            aria-hidden
            className="absolute inset-0 -translate-x-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            }}
            animate={{ translateX: ["−100%", "200%"] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Inner ripple on hover */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {icon && <span className={s.iconSize + " flex items-center"}>{icon}</span>}
              {children}
              {iconEnd && <span className={s.iconSize + " flex items-center"}>{iconEnd}</span>}
            </>
          )}
        </span>
      </motion.button>
    )
  }
)

GradientButton.displayName = "GradientButton"

// ─── DestructiveButton ───────────────────────────────────────────────────────

interface DestructiveButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  size?:     ButtonSize
  loading?:  boolean
  disabled?: boolean
  fullWidth?:boolean
  children?: React.ReactNode
}

/**
 * Destructive / delete action button.
 * Uses a muted red with glow on hover.
 */
export const DestructiveButton = forwardRef<HTMLButtonElement, DestructiveButtonProps>(
  ({ size = "md", loading, disabled, fullWidth, children, className, ...props }, ref) => {
    const isDisabled = disabled || loading
    const s = sizes[size]

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "font-semibold select-none cursor-pointer",
          "bg-[rgba(255,68,114,0.15)] border border-[rgba(255,68,114,0.30)]",
          "text-[#FF6B8F]",
          s.px,
          s.text,
          s.radius,
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{ height: s.height }}
        whileTap={isDisabled ? undefined : { scale: 0.965 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </motion.button>
    )
  }
)

DestructiveButton.displayName = "DestructiveButton"