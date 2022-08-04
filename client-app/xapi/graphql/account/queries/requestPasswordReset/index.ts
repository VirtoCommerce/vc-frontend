import { Query, QueryRequestPasswordResetArgs } from "@/xapi/types";
import requestPasswordResetDocument from "./requestPasswordReset.graphql";

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
