import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { transactionKeys, summaryKeys } from "@/src/lib/query-keys";

// ── Types ─────────────────────────────────────────────────────────────────────

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$patch"]
>["json"];

// ── Mutation function ─────────────────────────────────────────────────────────

async function editTransaction(
  id: string,
  json: RequestType
): Promise<ResponseType> {
  const response = await client.api.transactions[":id"]["$patch"]({
    json,
    param: { id },
  });
  return response.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: (json) => editTransaction(id!, json),
    onSuccess: () => {
      toast.success("Transaction updated.");
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to edit transaction.");
    },
  });
};