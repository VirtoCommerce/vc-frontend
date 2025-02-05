import { graphqlClient } from "@/core/api/graphql/client";
import { ActivateBackInStockSubscriptionDocument } from "../../types";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionType,
  Mutations,
  MutationsActivateBackInStockSubscriptionArgs,
} from "../../types";

export async function activateBackInStockSubscription(
  payload: ActivateBackInStockSubscriptionCommandType,
): Promise<BackInStockSubscriptionType | undefined> {
  const {data} = await graphqlClient.mutate<
    Required<Pick<Mutations, "activateBackInStockSubscription">>,
    MutationsActivateBackInStockSubscriptionArgs
  >({
    mutation: ActivateBackInStockSubscriptionDocument,
    variables: {
      command: payload,
    },
  });

  return data?.activateBackInStockSubscription;
}
