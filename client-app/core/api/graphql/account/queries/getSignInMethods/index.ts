import { useQuery } from "@vue/apollo-composable";
import { GetSignInMethodsDocument } from "@/core/api/graphql/types";

export function useGetSignInMethodsQuery() {
  return useQuery(GetSignInMethodsDocument);
}
