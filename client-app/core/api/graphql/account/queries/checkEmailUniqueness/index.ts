import { graphqlClient } from "../../../client";
import { CheckEmailUniquenessDocument } from "./checkEmailUniquenessQuery.generated";
import type { Query, QueryCheckEmailUniquenessArgs } from "@/core/api/graphql/types/base.generated";

export async function checkEmailUniqueness(payload: QueryCheckEmailUniquenessArgs): Promise<boolean> {
  const { data } = await graphqlClient.query<
    Required<Pick<Query, "checkEmailUniqueness">>,
    QueryCheckEmailUniquenessArgs
  >({
    query: CheckEmailUniquenessDocument,
    variables: {
      ...payload,
    },
  });

  return data.checkEmailUniqueness;
}
