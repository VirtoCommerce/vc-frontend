import { useQuery } from "@vue/apollo-composable";
import { toValue } from "vue";
import { globals } from "@/core/globals";
import GetProductDetailsDocument from "./getProductDetails.graphql";
import type { MaybeRefOrGetter } from "vue";

export function getProductDetails(payload: MaybeRefOrGetter<{ productIds: string }>) {
  const { storeId, cultureName, currencyCode } = globals;
  return useQuery(
    GetProductDetailsDocument,
    {
      storeId: toValue(storeId),
      cultureName: toValue(cultureName),
      currencyCode: toValue(currencyCode),
      productIds: toValue(payload).productIds,
    },
    { fetchPolicy: "cache-and-network" },
  );
}
