import { graphqlClient } from "../../../client";
import checkEmailUniquenessQueryDocument from "./checkEmailUniquenessQuery.graphql";
import type { Query, QueryCheckEmailUniquenessArgs } from "@/core/api/graphql/types";

export async function checkEmailUniqueness(payload: QueryCheckEmailUniquenessArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "checkEmailUniqueness">>,
    QueryCheckEmailUniquenessArgs
  >({
    query: checkEmailUniquenessQueryDocument,
    variables: {
      ...payload,
    },
  });

  return data.checkEmailUniqueness;
}
