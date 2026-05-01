"use client";

// components/welcome-msg.tsx
//
// CHANGES FROM ORIGINAL:
// ─ Added a subtitle line on mobile ("Your financial overview")
// ─ Font sizes made responsive: text-2xl mobile → text-4xl desktop
// ─ Everything else unchanged

import { useUser } from "@clerk/nextjs";

export const WelcomeMsg = () => {
  const { user, isLoaded } = useUser();

  return (
    <div className="mb-4 space-y-1">
      <h2 className="text-2xl font-medium text-white lg:text-4xl">
        Welcome back{isLoaded && user?.firstName ? `, ${user.firstName}` : ""}
        {!isLoaded && " "}
        <span className="inline-block">👋</span>
      </h2>
      {/* Subtitle: mobile only — gives context below the greeting */}
      <p className="text-sm text-blue-100 lg:hidden">
        Here&apos;s your financial overview
      </p>
    </div>
  );
};