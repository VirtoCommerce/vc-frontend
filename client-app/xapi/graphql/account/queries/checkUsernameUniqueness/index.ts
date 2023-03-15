import checkUsernameUniquenessQueryDocument from "./checkUsernameUniquenessQuery.graphql";
import type { Query, QueryCheckUsernameUniquenessArgs } from "@/xapi/types";

export default async function checkUsernameUniqueness(payload: QueryCheckUsernameUniquenessArgs): Promise<boolean> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
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
