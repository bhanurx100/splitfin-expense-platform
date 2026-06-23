import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAccountMutation } from "./account-mutations";

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation(updateAccountMutation(queryClient, id));
};