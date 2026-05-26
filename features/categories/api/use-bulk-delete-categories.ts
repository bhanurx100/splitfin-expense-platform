import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";
import { categoryKeys, summaryKeys } from "@/lib/query-keys";

type ResponseType = InferResponseType<
  (typeof client.api.categories)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.categories)["bulk-delete"]["$post"]
>["json"];

async function bulkDeleteCategories(json: RequestType): Promise<ResponseType> {
  const response = await client.api.categories["bulk-delete"]["$post"]({ json });
  return response.json();
}

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: bulkDeleteCategories,
    onSuccess: () => {
      toast.success("Categories deleted.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: summaryKeys.all });
    },
    onError: () => {
      toast.error("Failed to delete categories.");
    },
  });
};