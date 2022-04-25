import client from "@core/api/graphql/graphql-client";
import { Query, QueryCheckEmailUniquenessArgs } from "@core/api/graphql/types";
import checkEmailUniquenessQueryDocument from "./checkEmailUniquenessQuery.graphql";

export default async function checkUsernameUniqueness(payload: QueryCheckEmailUniquenessArgs): Promise<boolean> {
  const { data } = await client.query<Required<Pick<Query, "checkEmailUniqueness">>, QueryCheckEmailUniquenessArgs>({
    query: checkEmailUniquenessQueryDocument,
    variables: {
      ...payload,
    },
  });

  return data.checkEmailUniqueness;
}
