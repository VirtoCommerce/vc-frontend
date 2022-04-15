import { currentUserId, storeId } from "@core/constants";

import { UserBalance } from "@core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import getUserBalanceQueryDocument from "./getUserBalanceQuery.graphql";

export default async function getUserBalance(): Promise<UserBalance> {
  const { data } = await client.query({
    query: getUserBalanceQueryDocument,
    variables: {
      userId: currentUserId,
      storeId,
      includeOperations: false,
    },
  });
  return data?.balance;
}
