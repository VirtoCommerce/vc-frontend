import { useLazyQuery } from "@vue/apollo-composable";
import { GetFullCartDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetFullCartQuery(cartId?: string) {
  const { storeId, cultureName, currencyCode, userId } = globals;

  return useLazyQuery(
    GetFullCartDocument,
    {
      storeId,
      cultureName,
      currencyCode,
      userId,
      cartId,
    },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
