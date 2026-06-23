import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { transactionKeys, summaryKeys } from "@/src/lib/query-keys";

// ── Response type (preserved — used by callers) ───────────────────────────────

export type DeleteTransactionResponse = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"]
>;

// ── Mutation function ─────────────────────────────────────────────────────────

async function deleteTransaction(id: string): Promise<DeleteTransactionResponse> {
  const response = await client.api.transactions[":id"]["$delete"]({
    param: { id },
  });
  return response.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteTransactionResponse, Error>({
    mutationFn: () => deleteTransaction(id!),
    onSuccess: () => {
      toast.success("Transaction deleted.");
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to delete transaction.");
    },
  });
};