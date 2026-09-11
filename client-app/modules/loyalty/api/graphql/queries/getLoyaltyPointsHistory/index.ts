import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetLoyaltyPointsHistoryDocument } from "../../types";
import type { QueryLoyaltyPointsHistoryArgs } from "../../types";

export async function getLoyaltyPointsHistory(payload?: Partial<QueryLoyaltyPointsHistoryArgs>) {
  const { storeId } = globals;

  const { data } = await graphqlClient.query({
    query: GetLoyaltyPointsHistoryDocument,
    variables: {
      storeId,
      ...payload,
    },
  });

  return data.loyaltyPointsHistory;
}
