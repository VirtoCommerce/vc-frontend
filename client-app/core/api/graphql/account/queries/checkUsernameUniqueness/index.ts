import { graphqlClient } from "../../../client";
import { CheckUsernameUniquenessDocument } from "./checkUsernameUniquenessQuery.generated";
import type { Query, QueryCheckUsernameUniquenessArgs } from "@/core/api/graphql/types";

export async function checkUsernameUniqueness(payload: QueryCheckUsernameUniquenessArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "checkUsernameUniqueness">>,
    QueryCheckUsernameUniquenessArgs
  >({
    query: CheckUsernameUniquenessDocument,
    variables: {
      ...payload,
    },
  });

  return data.checkUsernameUniqueness;
}
