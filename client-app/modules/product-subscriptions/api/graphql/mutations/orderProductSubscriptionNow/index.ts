import { graphqlClient } from "@/core/api/graphql/client";
import { OrderProductSubscriptionNowDocument } from "../../types";
import type { InputProductSubscriptionId, OrderProductSubscriptionNowMutation } from "../../types";

export async function orderProductSubscriptionNow(
  command: InputProductSubscriptionId,
): Promise<OrderProductSubscriptionNowMutation["orderProductSubscriptionNow"]> {
  const { data } = await graphqlClient.mutate({
    mutation: OrderProductSubscriptionNowDocument,
    variables: { command },
  });

  return data!.orderProductSubscriptionNow;
}
