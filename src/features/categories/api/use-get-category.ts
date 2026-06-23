import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/hono";
import { categoryKeys } from "@/src/lib/query-keys";

async function fetchCategory(id: string) {
  const response = await client.api.categories[":id"].$get({ param: { id } });
  if (!response.ok) throw new Error("Failed to fetch category.");
  const { data } = await response.json();
  return data;
}

export const useGetCategory = (id?: string) =>
  useQuery({
    enabled:  !!id,
    queryKey: categoryKeys.detail(id!),
    queryFn:  () => fetchCategory(id!),
  });