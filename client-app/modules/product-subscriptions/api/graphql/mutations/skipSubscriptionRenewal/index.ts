import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SkipSubscriptionRenewalDocument } from "../../types";
import type { InputSubscriptionRenewalId, SkipSubscriptionRenewalMutation } from "../../types";

export async function skipSubscriptionRenewal(
  command: InputSubscriptionRenewalId,
): Promise<SkipSubscriptionRenewalMutation["skipSubscriptionRenewal"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SkipSubscriptionRenewalDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.skipSubscriptionRenewal;
}
