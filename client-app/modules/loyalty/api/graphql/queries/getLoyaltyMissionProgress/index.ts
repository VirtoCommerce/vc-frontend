import { graphqlClient } from "@/core/api/graphql/client";
import { useCurrency } from "@/core/composables";
import { globals } from "@/core/globals";
import { GetLoyaltyMissionProgressDocument } from "../../types";
import type { QueryLoyaltyMissionProgressArgs } from "../../types";

export async function getLoyaltyMissionProgress(payload?: Partial<QueryLoyaltyMissionProgressArgs>) {
  const { storeId, cultureName } = globals;
  const { currentCurrency } = useCurrency();

  const { data } = await graphqlClient.query({
    query: GetLoyaltyMissionProgressDocument,
    variables: {
      storeId,
      cultureName,
      currencyCode: currentCurrency.value?.code,
      ...payload,
    },
  });

  return data.loyaltyMissionProgress;
}
