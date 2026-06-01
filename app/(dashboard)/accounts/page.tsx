"use client";

/**
 * app/(dashboard)/accounts/page.tsx
 *
 * Renders AccountsMainScreen only.
 * Existing bottom nav / AppShell wraps this automatically.
 */

import { AccountsMainScreen } from "@/features/accounts/components/AccountsMainScreen";

export default function AccountsPage() {
  return <AccountsMainScreen />;
}