import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { GetShortCartDocument } from "@/core/api/graphql/types";

export function useGetShortCartQuery() {
  const route = useRoute();
  const shouldWaitFullCart = computed(() => route.name === "Cart" && !route.params.cartId);
  return useQuery(GetShortCartDocument, useCartQueryVariables(), {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: shouldWaitFullCart.value ? "cache-only" : "cache-first",
  });
}
