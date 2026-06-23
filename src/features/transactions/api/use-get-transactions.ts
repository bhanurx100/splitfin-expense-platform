import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { transactionListQuery } from "./transaction-queries";

export const useGetTransactions = () => {
  const searchParams = useSearchParams();

  const filters = {
    from:      searchParams.get("from")      ?? "",
    to:        searchParams.get("to")        ?? "",
    accountId: searchParams.get("accountId") ?? "",
  };

  return useQuery(transactionListQuery(filters));
};