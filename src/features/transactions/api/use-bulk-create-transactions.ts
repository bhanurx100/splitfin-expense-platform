import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { transactionKeys, summaryKeys } from "@/src/lib/query-keys";

// ── Types ─────────────────────────────────────────────────────────────────────

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

// ── Mutation function ─────────────────────────────────────────────────────────

async function bulkCreateTransactions(
  json: RequestType
): Promise<ResponseType> {
  const response = await client.api.transactions["bulk-create"]["$post"]({
    json,
  });
  return response.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: bulkCreateTransactions,
    onSuccess: () => {
      toast.success("Transaction(s) created.");
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to create transaction(s).");
    },
  });
};