import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/hono";
import { convertAmountFromMilliunits } from "@/src/lib/utils";
import { transactionKeys } from "@/src/lib/query-keys";

// ── Query function ────────────────────────────────────────────────────────────
// Extracted so it can be shared with prefetching or server-side usage.

async function fetchTransaction(id: string) {
  const response = await client.api.transactions[":id"].$get({ param: { id } });

  if (!response.ok) throw new Error("Failed to fetch transaction.");

  const { data } = await response.json();

  return {
    ...data,
    amount: convertAmountFromMilliunits(data.amount),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useGetTransaction = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: transactionKeys.detail(id!),
    queryFn: () => fetchTransaction(id!),
  });