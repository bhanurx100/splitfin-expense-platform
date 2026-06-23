/**
 * shared/navigation/PageContainer.tsx
 *
 * Canonical page wrapper. Handles:
 *   - max-width cap
 *   - horizontal padding (3-step responsive)
 *   - top padding
 *   - bottom clearance for mobile dock (72px) + safe area
 *
 * Variants:
 *   default  — standard pages (accounts, categories, transactions)
 *   wide     — split pay (1400px cap)
 *   flush    — no padding (home hero overrides its own padding)
 */

import { cn } from "@/src/lib/utils";
import React from "react";

type Variant = "default" | "wide" | "flush";

type PageContainerProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Override top padding (e.g. home page has its own hero) */
  noPadTop?: boolean;
};

const VARIANT_CLS: Record<Variant, string> = {
  default: "mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8",
  wide: "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8",
  flush: "mx-auto w-full max-w-screen-xl",
};

export function PageContainer({
  children,
  variant = "default",
  className,
  noPadTop = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        VARIANT_CLS[variant],
        // Top rhythm
        !noPadTop && "pt-5 lg:pt-7",
        // Bottom: 28 = 112px clears dock (64px) + safe area + gap on mobile
        // lg: standard 10 = 40px
        "pb-28 lg:pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}