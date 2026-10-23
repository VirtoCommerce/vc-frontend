import { graphqlClient } from "@/core/api/graphql/client";
import { RetrySubscriptionRenewalPaymentDocument } from "../../types";
import type { InputSubscriptionRenewalId, RetrySubscriptionRenewalPaymentMutation } from "../../types";

export async function retrySubscriptionRenewalPayment(
  command: InputSubscriptionRenewalId,
): Promise<RetrySubscriptionRenewalPaymentMutation["retrySubscriptionRenewalPayment"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RetrySubscriptionRenewalPaymentDocument,
    variables: { command },
  });

  return data!.retrySubscriptionRenewalPayment;
}
