/**
 * shared/charts/index.ts
 *
 * Re-exports chart primitives that are used across features.
 * The underlying implementations remain in features/dashboard/sections/
 * and components/dashboard/ until those are migrated.
 *
 * Import from here in new code — insulates against future moves.
 */

// Area/bar/line wrappers (existing components/*)
export { AreaVariant } from "@/features/dashboard/components/area-variant";
export { BarVariant } from "@/features/dashboard/components/bar-variant";
export { LineVariant } from "@/features/dashboard/components/line-variant";

// Feature-level chart cards (self-fetching, page-sized)
// These stay in features/dashboard/sections/ — just re-exported here
// for discoverability. Import directly from feature if you need tree-shaking.
export {
  CashFlowChart,
  CategoryPieCard,
  TopSpendingCard,
} from "@/features/dashboard/sections/dashboard-charts";
