import { Query, QueryCheckEmailUniquenessArgs } from "@/xapi/types";
import checkEmailUniquenessQueryDocument from "./checkEmailUniquenessQuery.graphql";

export default async function checkUsernameUniqueness(payload: QueryCheckEmailUniquenessArgs): Promise<boolean> {
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
