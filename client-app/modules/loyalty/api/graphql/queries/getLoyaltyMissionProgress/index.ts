import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetLoyaltyMissionProgressDocument } from "../../types";
import type { QueryLoyaltyMissionProgressArgs } from "../../types";

export async function getLoyaltyMissionProgress(payload?: QueryLoyaltyMissionProgressArgs) {
  const { storeId, cultureName } = globals;

  const { data } = await graphqlClient.query({
    query: GetLoyaltyMissionProgressDocument,
    variables: {
      storeId,
      cultureName,
      ...payload,
    },
  });

  return data.loyaltyMissionProgress;
}
