import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";
import { categoryKeys } from "@/lib/query-keys";

type ResponseType = InferResponseType<typeof client.api.categories.$post>;
type RequestType  = InferRequestType<typeof client.api.categories.$post>["json"];

async function createCategory(json: RequestType): Promise<ResponseType> {
  const response = await client.api.categories.$post({ json });
  return response.json();
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: () => {
      toast.error("Failed to create category.");
    },
  });
};