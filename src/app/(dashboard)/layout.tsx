// app/(dashboard)/layout.tsx
import type { PropsWithChildren } from "react";
import { AppShell } from "@/src/shared/navigation";

const DashboardLayout = ({ children }: PropsWithChildren) => (
  <AppShell>
    {children}
  </AppShell>
);

export default DashboardLayout;