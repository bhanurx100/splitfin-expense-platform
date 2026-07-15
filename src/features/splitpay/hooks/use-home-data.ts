"use client"

/**
 * useHomeData — provides Split Home page data.
 *
 * Currently returns mock data synchronously.
 * In production: replace internals with a TanStack Query useQuery call.
 * The component API stays identical — swap without touching UI.
 */

import { useMemo } from "react"
import {
  MOCK_HOME_DATA,
  MOCK_NAV_ITEMS,
} from "../constants/mock-home-data"
import type { HomePageData, SplitNavItem } from "../types"

interface UseHomeDataReturn {
  data:      HomePageData
  navItems:  SplitNavItem[]
  isLoading: boolean
  isError:   boolean
}

export function useHomeData(): UseHomeDataReturn {
  // Memoize so referential stability is maintained across renders.
  // When real API is wired, replace `MOCK_HOME_DATA` with `query.data`.
  const data     = useMemo(() => MOCK_HOME_DATA, [])
  const navItems = useMemo(() => MOCK_NAV_ITEMS, [])

  return {
    data,
    navItems,
    isLoading: false,
    isError:   false,
  }
}