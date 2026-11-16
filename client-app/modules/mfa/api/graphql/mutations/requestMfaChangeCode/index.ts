import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { RequestMfaChangeCodeDocument } from "../../types";
import type { RequestMfaChangeCodeMutation, RequestMfaChangeCodeMutationVariables } from "../../types";

export async function requestMfaChangeCode(): Promise<RequestMfaChangeCodeMutation["requestMfaChangeCode"]> {
  const { storeId } = globals;

  const { data } = await graphqlClient.mutate<RequestMfaChangeCodeMutation, RequestMfaChangeCodeMutationVariables>({
    mutation: RequestMfaChangeCodeDocument,
    variables: { command: { storeId } },
    // The widget shows the error next to the switch or the code
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  return data?.requestMfaChangeCode;
}
