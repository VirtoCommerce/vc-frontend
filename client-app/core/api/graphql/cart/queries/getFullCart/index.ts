import { useLazyQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { GetFullCartDocument } from "@/core/api/graphql/types";
import { useCartContext } from "@/core/composables/useCartContext";
import { globals } from "@/core/globals";

export function useGetFullCartQuery(cartId?: string) {
  const { storeId, cultureName, currencyCode, userId } = globals;
  const { cartName } = useCartContext();

  return useLazyQuery(
    GetFullCartDocument,
    computed(() => ({
      storeId,
      cultureName,
      currencyCode,
      userId,
      cartId,
      cartName: cartName.value,
    })),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
