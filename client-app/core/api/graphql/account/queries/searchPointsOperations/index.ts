import { currentUserId, storeId } from "@core/constants";

import { SearchPointsOperationsResultType } from "@core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import searchPointsOperationsQueryDocument from "./searchPointsOperationsQuery.graphql";

async function searchPointsOperations(skip: number, take: number): Promise<SearchPointsOperationsResultType> {
  const { data } = await client.query({
    query: searchPointsOperationsQueryDocument,
    variables: {
      userId: currentUserId,
      storeId,
      skip: skip,
      take: take,
    },
  });
  return data?.searchPointsOperations;
}
export default searchPointsOperations;
