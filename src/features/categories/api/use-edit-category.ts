import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/hono";
import { categoryKeys, transactionKeys, summaryKeys } from "@/src/lib/query-keys";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.categories)[":id"]["$patch"]
>["json"];

async function editCategory(id: string, json: RequestType): Promise<ResponseType> {
  const response = await client.api.categories[":id"]["$patch"]({
    json,
    param: { id },
  });
  return response.json();
}

export const useEditCategory = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: (json) => editCategory(id!, json),
    onSuccess: () => {
      toast.success("Category updated.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id!) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to edit category.");
    },
  });
};