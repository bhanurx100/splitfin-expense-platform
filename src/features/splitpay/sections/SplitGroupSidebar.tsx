"use client";
/**
 * features/splitpay/sections/SplitGroupSidebar.tsx
 *
 * Shell: the left-column group list panel.
 * Extracted from SplitPage layout — purely structural.
 *
 * Renders SplitGroupsSection (already extracted) inside the correct
 * responsive column with sticky/scroll behaviour.
 *
 * Does NOT touch:
 *   - Zustand store
 *   - settlement calculations
 *   - expense form
 */

import { cn } from "@/src/lib/utils";
import { SplitGroupsSection } from "./split-groups-section";

type Props = {
  /** Hidden on mobile when workspace drill-down is active */
  hidden: boolean;
  onSelectGroup: (id: string) => void;
};

export function SplitGroupSidebar({ hidden, onSelectGroup }: Props) {
  return (
    <div
      className={cn(
        "min-w-0",
        hidden ? "hidden lg:block" : "block",
      )}
    >
      <SplitGroupsSection onSelectGroup={onSelectGroup} />
    </div>
  );
}