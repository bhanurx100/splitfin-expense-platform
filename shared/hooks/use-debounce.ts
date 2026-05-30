"use client";

/**
 * shared/hooks/use-debounce.ts
 *
 * Generic debounce hook — delays updating the returned value until
 * `delay` ms have passed without a new value arriving.
 *
 * Useful for search inputs, filter fields, resize handlers.
 *
 * @example
 *   const debouncedSearch = useDebounce(search, 300);
 *   // use debouncedSearch in your query rather than raw search
 */

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}