"use client";

/**
 * features/splitpay/sections/split-header.tsx
 * Page-level heading. Hidden on mobile when viewing group detail.
 */

import { cn } from "@/lib/utils";

type Props = {
  /** Hides header on mobile when drill-down view is active */
  hidden: boolean;
};

export function SplitHeader({ hidden }: Props) {
  return (
    <div className={cn("mb-5 lg:mb-6", hidden ? "hidden lg:block" : "block")}>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 lg:text-2xl">
        Split &amp; Pay
      </h1>
      <p className="mt-0.5 text-[13px] text-slate-400 dark:text-slate-500">
        Manage groups · split expenses · settle via UPI
      </p>
    </div>
  );
}