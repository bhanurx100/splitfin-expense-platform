/**
 * lib/layout.ts
 *
 * SpendWise Layout System — single source of truth.
 *
 * CONTAINER: max-w-screen-xl (1280px) everywhere — consistent cap.
 * PADDING:   px-4 sm:px-6 lg:px-8 — three-step responsive horizontal rhythm.
 * VERTICAL:  py-6 lg:py-8 for page tops, space-y-6 between sections.
 * CARDS:     p-5 (mobile) → p-6 (lg+) — one rule.
 * SIDEBAR:   w-60 (240px) fixed; main offset lg:pl-60.
 * BOTTOM NAV: pb-24 mobile (nav + FAB clearance), pb-0 lg.
 */

/** Max-width applied to every page content area. */
export const CONTAINER = "mx-auto w-full max-w-screen-xl";

/**
 * Horizontal page padding — narrows gracefully on small screens.
 * Use as the only horizontal padding on the outermost page div.
 */
export const PAGE_X = "px-4 sm:px-6 lg:px-8";

/** Vertical page padding — top breathing room. */
export const PAGE_Y = "py-6 lg:py-8";

/** Combined page wrapper: container + both paddings. */
export const PAGE = `${CONTAINER} ${PAGE_X} ${PAGE_Y}`;

/** Section gap between major content blocks (e.g. header → cards → table). */
export const SECTION_GAP = "space-y-6 lg:space-y-8";

/** Card internal padding — consistent across all cards. */
export const CARD_P = "p-5 lg:p-6";

/** Card internal padding — compact variant (used inside panels). */
export const CARD_P_SM = "p-4 lg:p-5";

/** Page section header (title + action button row). */
export const PAGE_HEADER = "flex items-center justify-between mb-6 lg:mb-8";

/** Sub-section header (e.g. "All Accounts" above a table). */
export const SECTION_HEADER = "flex items-center justify-between mb-4 lg:mb-5";

/**
 * Responsive grid for stat/summary cards.
 * 1 col mobile → 2 col sm → auto-fit lg.
 */
export const STATS_GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5";

/**
 * Two-column dashboard grid:
 * Full-width mobile, 5/3 split at xl.
 */
export const DASH_GRID = "grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6";
export const DASH_MAIN = "xl:col-span-8 space-y-5 lg:space-y-6";
export const DASH_SIDE = "xl:col-span-4 space-y-5 lg:space-y-6";

/**
 * Mobile bottom clearance — accounts for bottom nav (56px) + FAB (56px) + gap.
 * Applied to main content wrapper on mobile.
 */
export const MOBILE_BOTTOM = "pb-32 lg:pb-0";