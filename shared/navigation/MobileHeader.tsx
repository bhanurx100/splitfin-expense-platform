"use client";
/**
 * shared/navigation/MobileHeader.tsx
 *
 * Sticky top bar — mobile only (hidden lg+).
 * Renders: logo · page title · theme toggle · user button.
 * No per-page state → never rerenders on route changes.
 */

import { TrendingUp, Loader2 } from "lucide-react";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/shared/components/theme-toggle";

export function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden"
      style={{
        background: "var(--sf-card)",
        borderBottom: "1px solid var(--sf-border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)" }}
        >
          <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: "var(--sf-text-primary)" }}
        >
          Split<span style={{ color: "#6C5CE7" }}>Fin</span>
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: "var(--sf-text-muted)" }}
          />
        </ClerkLoading>
      </div>
    </header>
  );
}
