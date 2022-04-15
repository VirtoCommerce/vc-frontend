import { currentUserId, storeId } from "@core/constants";

import { PointsOperationConnection } from "@core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import searchPointsOperationsQueryDocument from "./searchPointsOperationsQuery.graphql";

export default async function searchPointsOperations(after: string, first: number): Promise<PointsOperationConnection> {
  const { data } = await client.query({
    query: searchPointsOperationsQueryDocument,
    variables: {
      userId: currentUserId,
      storeId,
      after,
      first,
    },
  });
  return data?.pointsOperations;
}
