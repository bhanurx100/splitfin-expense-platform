import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/hono";
import { categoryKeys } from "@/src/lib/query-keys";

async function fetchCategories() {
  const response = await client.api.categories.$get();
  if (!response.ok) throw new Error("Failed to fetch categories.");
  const { data } = await response.json();
  return data;
}

export const useGetCategories = () =>
  useQuery({
    queryKey: categoryKeys.lists(),
    queryFn:  fetchCategories,
  });