// app/(dashboard)/layout.tsx
import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/app/AppShell";

// Layout is a bare shell — no global Header, no padding.
// Every page owns its own header section.
// AppShell provides: bg, BottomNav, FAB on mobile; DesktopNav on lg+.
const DashboardLayout = ({ children }: PropsWithChildren) => (
  <AppShell>
    <main>{children}</main>
  </AppShell>
);

export default DashboardLayout;