import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { RetrySubscriptionRenewalPaymentDocument } from "../../types";
import type { InputSubscriptionRenewalId, RetrySubscriptionRenewalPaymentMutation } from "../../types";

export async function retrySubscriptionRenewalPayment(
  command: InputSubscriptionRenewalId,
): Promise<RetrySubscriptionRenewalPaymentMutation["retrySubscriptionRenewalPayment"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RetrySubscriptionRenewalPaymentDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.retrySubscriptionRenewalPayment;
}
