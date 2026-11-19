import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { AcceptSubscriptionRenewalDocument } from "../../types";
import type { InputSubscriptionRenewalId, AcceptSubscriptionRenewalMutation } from "../../types";

export async function acceptSubscriptionRenewal(
  command: InputSubscriptionRenewalId,
): Promise<AcceptSubscriptionRenewalMutation["acceptSubscriptionRenewal"]> {
  const { data } = await graphqlClient.mutate({
    mutation: AcceptSubscriptionRenewalDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.acceptSubscriptionRenewal;
}
