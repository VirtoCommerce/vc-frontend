import { graphqlClient } from "@/core/api/graphql/client";
import { GetLoyaltyBalanceDocument } from "../../types";

export async function useGetLoyaltyBalance(orderId?: string) {
    const { data } = await graphqlClient.query({
        query: GetLoyaltyBalanceDocument,
        variables: {
            orderId
        },
    });

    return data.loyaltyBalance;
}
