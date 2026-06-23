/**
 * shared/ui/index.ts
 *
 * Barrel for all shared UI primitives.
 * Import from "@/shared/ui" for any generic, reusable UI atom.
 *
 * Do NOT import feature-specific components here.
 * Do NOT re-export from components/ui/* (those use shadcn paths directly).
 */

// ── Loading states ─────────────────────────────────────────────────────────────
export {
  Spinner,
  InlineLoading,
  Skeleton,
  SkeletonRow,
  SkeletonCard,
  SkeletonGrid,
  LoadingState,
} from "./LoadingState";

// ── Error states ───────────────────────────────────────────────────────────────
export {
  InlineError,
  ErrorCard,
  ErrorState,
} from "./ErrorState";

// ── Empty state ────────────────────────────────────────────────────────────────
// EmptyState.tsx already exists — re-exported here for single import point.
export { EmptyState } from "./EmptyState";