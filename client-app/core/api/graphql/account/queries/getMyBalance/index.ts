import { currentUserId, storeId } from "@core/constants";

import { UserBalanceType } from "@core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import getMyBalanceQueryDocument from "./getMyBalanceQuery.graphql";

async function getMyBalance(): Promise<UserBalanceType> {
  const { data } = await client.query({
    query: getMyBalanceQueryDocument,
    variables: {
      userId: currentUserId,
      storeId,
      includeOperations: false,
    },
  });
  return data?.balance;
}
export default getMyBalance;
