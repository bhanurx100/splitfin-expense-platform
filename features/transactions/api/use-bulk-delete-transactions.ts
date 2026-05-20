import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";
import { transactionKeys, summaryKeys } from "@/lib/query-keys";

// ── Types ─────────────────────────────────────────────────────────────────────

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-delete"]["$post"]
>["json"];

// ── Mutation function ─────────────────────────────────────────────────────────

async function bulkDeleteTransactions(
  json: RequestType
): Promise<ResponseType> {
  const response = await client.api.transactions["bulk-delete"]["$post"]({
    json,
  });
  return response.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: bulkDeleteTransactions,
    onSuccess: () => {
      toast.success("Transaction(s) deleted.");
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to delete transaction(s).");
    },
  });
};