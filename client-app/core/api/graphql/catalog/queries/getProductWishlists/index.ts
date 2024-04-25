import { useLazyQuery } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import { GetProductWishlistsDocument } from "../../../types";

export function useGetProductWishlistsQuery(productId: string) {
  const { storeId, cultureName, currencyCode } = globals;

  return useLazyQuery(
    GetProductWishlistsDocument,
    { storeId, cultureName, currencyCode, id: productId },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
}
