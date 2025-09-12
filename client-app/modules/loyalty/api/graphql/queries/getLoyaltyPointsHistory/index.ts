import { graphqlClient } from "@/core/api/graphql/client";
import { GetLoyaltyPointsHistoryDocument } from "../../types";
import type { QueryLoyaltyPointsHistoryArgs } from "../../types";

export async function getLoyaltyPointsHistory(payload?: QueryLoyaltyPointsHistoryArgs) {
    const { data } = await graphqlClient.query({
        query: GetLoyaltyPointsHistoryDocument,
        variables: {
            ...payload,
        }
    });

    return data.loyaltyPointsHistory;
}
