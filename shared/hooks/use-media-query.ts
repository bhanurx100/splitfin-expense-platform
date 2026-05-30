"use client";

/**
 * shared/hooks/use-media-query.ts
 *
 * Generic media-query hook — returns true when the query matches.
 * SSR-safe: returns `defaultValue` on the server and before hydration.
 *
 * Replaces direct usage of `react-use`'s `useMedia` throughout the app
 * so we have a single, testable implementation with no external dep.
 *
 * @example
 *   const isMobile = useMediaQuery("(max-width: 1024px)");
 *   const prefersLight = useMediaQuery("(prefers-color-scheme: light)", true);
 */

import { useState, useEffect } from "react";

export function useMediaQuery(
  query: string,
  defaultValue: boolean = false,
): boolean {
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql     = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Sync immediately on mount
    setMatches(mql.matches);

    // Modern API
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Legacy Safari
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}

// ── Named breakpoint helpers (optional convenience) ────────────────────────────

/** Returns true when viewport is below the lg breakpoint (< 1024px). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)", false);
}

/** Returns true when viewport is lg+ (≥ 1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)", false);
}