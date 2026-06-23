import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteAccountsMutation } from "./account-mutations";

export const useBulkDeleteAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation(bulkDeleteAccountsMutation(queryClient));
};