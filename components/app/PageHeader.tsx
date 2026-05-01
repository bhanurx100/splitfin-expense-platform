"use client";

// components/app/PageHeader.tsx
// Reusable blue gradient header bar used on every page.
// On the home page it shows greeting + account selector.
// On sub-pages it shows a back-able title row.

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** If set, shows a back arrow linking here */
  backHref?: string;
  /** Slot for right-side content (e.g. calendar icon) */
  right?: React.ReactNode;
  /** Extra gradient variant — defaults to blue */
  gradient?: string;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  right,
  gradient = "from-blue-700 via-blue-600 to-blue-500",
}: PageHeaderProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-5 pb-8 pt-5`}>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-blue-400/20" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-blue-100 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}