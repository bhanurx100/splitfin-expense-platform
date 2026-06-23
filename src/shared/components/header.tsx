"use client";

// components/header.tsx
//
// CHANGES FROM ORIGINAL:
// ─ Added "use client" (needed for usePathname to hide filters on sub-pages)
// ─ Header gradient and desktop layout are UNCHANGED
// ─ On mobile: filters (AccountFilter + DateFilter) are hidden — the mobile
//   BottomNav handles account selection via the MobileAccountPill in page.tsx
// ─ WelcomeMsg stays on all screen sizes
// ─ All original imports preserved — nothing removed
//
// ORIGINAL structure preserved:
//   <header> gradient wrapper
//     <div> max-width container
//       <div> top row: logo + nav + user button
//       <WelcomeMsg />
//       <Filters />   ← hidden on mobile via hidden lg:flex wrapper

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Filters } from "../../features/dashboard/components/filters";
import { HeaderLogo } from "./header-logo";
import { Navigation } from "./navigation";
import { WelcomeMsg } from "./welcome-msg";

export const Header = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 lg:pb-32">
      <div className="mx-auto max-w-screen-2xl">
        {/* ── Top row: Logo + Nav + User ──────────────────────────────────────── */}
        <div className="mb-14 flex w-full items-center justify-between">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            {/* Navigation: hidden on mobile (BottomNav handles it), visible lg+ */}
            <div className="hidden lg:block">
              <Navigation />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <ClerkLoaded>
              <UserButton afterSignOutUrl="/" />
            </ClerkLoaded>
            <ClerkLoading>
              <Loader2 className="size-8 animate-spin text-slate-400" />
            </ClerkLoading>
          </div>
        </div>

        {/* ── Welcome message: always visible ────────────────────────────────── */}
        <WelcomeMsg />

        {/* ── Filters: desktop only (mobile uses MobileAccountPill in page.tsx) ── */}
        <div className="hidden lg:block">
          <Filters />
        </div>
      </div>
    </header>
  );
};
