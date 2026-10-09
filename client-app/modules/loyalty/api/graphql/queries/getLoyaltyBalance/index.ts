import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetLoyaltyBalanceDocument } from "../../types";

export async function useGetLoyaltyBalance(orderId?: string) {
  const { storeId } = globals;

  const { data } = await graphqlClient.query({
    query: GetLoyaltyBalanceDocument,
    variables: {
      storeId,
      orderId,
    },
  });

  return data.loyaltyBalance;
}
