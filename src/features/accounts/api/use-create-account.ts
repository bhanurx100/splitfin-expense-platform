import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAccountMutation } from "./account-mutations";

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation(createAccountMutation(queryClient));
};