import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { ChangeProductSubscriptionDocument } from "../../types";
import type { InputChangeProductSubscription, ChangeProductSubscriptionMutation } from "../../types";

export async function changeProductSubscription(
  command: InputChangeProductSubscription,
): Promise<ChangeProductSubscriptionMutation["changeProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: ChangeProductSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.changeProductSubscription;
}
