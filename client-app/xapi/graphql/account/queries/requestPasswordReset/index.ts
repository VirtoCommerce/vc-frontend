import requestPasswordResetDocument from "./requestPasswordReset.graphql";
import type { Query, QueryRequestPasswordResetArgs } from "@/xapi/types";

export default async function requestPasswordReset(payload: QueryRequestPasswordResetArgs): Promise<boolean> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
    Required<Pick<Query, "requestPasswordReset">>,
    QueryRequestPasswordResetArgs
  >({
    query: requestPasswordResetDocument,
    variables: {
      ...payload,
    },
  });

  return data.requestPasswordReset;
}
