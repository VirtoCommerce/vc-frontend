import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { GetShortCartDocument } from "@/core/api/graphql/types";
import { useCartContext } from "@/core/composables/useCartContext";
import { globals } from "@/core/globals";

export function useGetShortCartQuery() {
  const { storeId, cultureName, currencyCode, userId } = globals;
  const { cartName } = useCartContext();

  return useQuery(
    GetShortCartDocument,
    computed(() => ({ storeId, cultureName, currencyCode, userId, cartName: cartName.value })),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-first",
    },
  );
}
