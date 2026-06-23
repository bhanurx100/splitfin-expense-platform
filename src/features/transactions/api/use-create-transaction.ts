import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { transactionKeys, summaryKeys } from "@/src/lib/query-keys";

// ── Types (preserved — callers infer from these) ──────────────────────────────

export type CreateTransactionResponse = InferResponseType<
  typeof client.api.transactions.$post
>;
export type CreateTransactionRequest = InferRequestType<
  typeof client.api.transactions.$post
>["json"];

// ── Mutation function ─────────────────────────────────────────────────────────

async function createTransaction(
  json: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  const response = await client.api.transactions.$post({ json });
  return response.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateTransactionResponse, Error, CreateTransactionRequest>({
    mutationFn: createTransaction,
    onSuccess: () => {
      toast.success("Transaction created.");
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to create transaction.");
    },
  });
};