import client from "@core/api/graphql/graphql-client";
import { Query, QueryCheckUsernameUniquenessArgs } from "@core/api/graphql/types";
import checkUsernameUniquenessQueryDocument from "./checkUsernameUniquenessQuery.graphql";

export default async function checkUsernameUniqueness(payload: QueryCheckUsernameUniquenessArgs): Promise<boolean> {
  const { data } = await client.query<
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
