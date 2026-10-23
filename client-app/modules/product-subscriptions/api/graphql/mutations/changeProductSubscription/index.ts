import { graphqlClient } from "@/core/api/graphql/client";
import { ChangeProductSubscriptionDocument } from "../../types";
import type { InputChangeProductSubscription, ChangeProductSubscriptionMutation } from "../../types";

export async function changeProductSubscription(
  command: InputChangeProductSubscription,
): Promise<ChangeProductSubscriptionMutation["changeProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: ChangeProductSubscriptionDocument,
    variables: { command },
  });

  return data!.changeProductSubscription;
}
