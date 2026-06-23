import { useQuery } from "@tanstack/react-query";
import { accountListQuery } from "./account-queries";

export const useGetAccounts = () => useQuery(accountListQuery());