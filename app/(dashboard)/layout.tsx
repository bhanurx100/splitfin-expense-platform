// app/(dashboard)/layout.tsx
import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/app/AppShell";

const DashboardLayout = ({ children }: PropsWithChildren) => (
  <AppShell>
    {children}
  </AppShell>
);

export default DashboardLayout;