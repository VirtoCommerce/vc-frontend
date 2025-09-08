import { GetLoyaltyBalanceDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

export async function useGetLoyaltyBalance(orderId: string) {
  const { data } = await graphqlClient.query({
    query: GetLoyaltyBalanceDocument,
    variables: {
      orderId
    },
  });

  return data.loyaltyBalance;
}
