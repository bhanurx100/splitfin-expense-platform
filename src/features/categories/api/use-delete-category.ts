import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { categoryKeys, transactionKeys, summaryKeys } from "@/src/lib/query-keys";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>;

async function deleteCategory(id: string): Promise<ResponseType> {
  const response = await client.api.categories[":id"]["$delete"]({ param: { id } });
  return response.json();
}

export const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error>({
    mutationFn: () => deleteCategory(id!),
    onSuccess: () => {
      toast.success("Category deleted.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to delete category.");
    },
  });
};