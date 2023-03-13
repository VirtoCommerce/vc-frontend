import checkEmailUniquenessQueryDocument from "./checkEmailUniquenessQuery.graphql";
import type { Query, QueryCheckEmailUniquenessArgs } from "@/xapi/types";

export default async function checkEmailUniqueness(payload: QueryCheckEmailUniquenessArgs): Promise<boolean> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
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
