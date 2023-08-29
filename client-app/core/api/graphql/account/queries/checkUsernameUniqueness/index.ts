import { graphqlClient } from "../../../client";
import checkUsernameUniquenessQueryDocument from "./checkUsernameUniquenessQuery.graphql";
import type { Query, QueryCheckUsernameUniquenessArgs } from "@/core/api/graphql/types";

export async function checkUsernameUniqueness(payload: QueryCheckUsernameUniquenessArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "checkUsernameUniqueness">>,
    QueryCheckUsernameUniquenessArgs
  >({
    query: checkUsernameUniquenessQueryDocument,
    variables: {
      ...payload,
    },
  });

  return data.checkUsernameUniqueness;
}
