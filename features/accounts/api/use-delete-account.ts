import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccountMutation } from "./account-mutations";

export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation(deleteAccountMutation(queryClient, id));
};