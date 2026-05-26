/**
 * features/summary/api/use-get-summary.ts
 *
 * Thin hook — reads URL search params, delegates to summaryQuery().
 *
 * Before: contained hono call, milliunit conversion, inline query key.
 * After:  reads params + calls useQuery(summaryQuery(filters)).
 *
 * Drop-in replacement — response shape is identical.
 */

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { summaryQuery } from "./summary-queries";

export const useGetSummary = () => {
  const searchParams = useSearchParams();

  const filters = {
    from:      searchParams.get("from")      ?? "",
    to:        searchParams.get("to")        ?? "",
    accountId: searchParams.get("accountId") ?? "",
  };

  return useQuery(summaryQuery(filters));
};