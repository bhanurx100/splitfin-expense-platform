import { useQuery } from "@tanstack/react-query";
import { accountDetailQuery } from "./account-queries";

export const useGetAccount = (id?: string) => useQuery(accountDetailQuery(id));