"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { auroraPress } from "./motion";

type AuroraButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children?: ReactNode;
};

const variants = {
  primary: "bg-[var(--aurora-gradient)] text-white shadow-[var(--aurora-glow-violet)]",
  secondary: "aurora-glass text-[var(--text-primary)] hover:bg-[var(--aurora-glass-strong)]",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--aurora-glass)] hover:text-[var(--text-primary)]",
  danger: "bg-[linear-gradient(135deg,var(--aurora-pink),#f06292)] text-white",
};
const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-base" };

export const AuroraButton = forwardRef<HTMLButtonElement, AuroraButtonProps>(function AuroraButton(
  { variant = "primary", size = "md", icon, className, children, disabled, type = "button", ...props }, ref,
) {
  return <motion.button ref={ref} type={type} disabled={disabled} whileTap={disabled ? undefined : auroraPress} className={cn("aurora-motion inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aurora-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-bg)] disabled:pointer-events-none disabled:opacity-45", variants[variant], sizes[size], className)} {...props}>{icon}{children}</motion.button>;
});

export function IconButton({ label, className, children, ...props }: Omit<HTMLMotionProps<"button">, "children"> & { label: string; children?: ReactNode }) {
  return <AuroraButton aria-label={label} title={label} variant="secondary" size="sm" className={cn("w-8 !px-0", className)} {...props}>{children}</AuroraButton>;
}
