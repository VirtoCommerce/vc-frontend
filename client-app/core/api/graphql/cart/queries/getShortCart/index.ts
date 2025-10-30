import { useQuery } from "@vue/apollo-composable";
import { GetShortCartDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetShortCartQuery() {
  return useQuery(GetShortCartDocument, globals, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-first",
  });
}
