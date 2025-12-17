import { useQuery } from "@vue/apollo-composable";
import { GetShortCartDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetShortCartQuery() {
  const { storeId, cultureName, currencyCode, userId } = globals;
  return useQuery(
    GetShortCartDocument,
    { storeId, cultureName, currencyCode, userId },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-first",
    },
  );
}
