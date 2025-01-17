import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./activateBackInStockSubscription.graphql";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionType,
  Mutations,
  MutationsActivateBackInStockSubscriptionArgs,
} from "../../types";

export async function activateBackInStockSubscription(
  payload: ActivateBackInStockSubscriptionCommandType,
): Promise<BackInStockSubscriptionType | undefined> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "activateBackInStockSubscription">>,
    MutationsActivateBackInStockSubscriptionArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data?.activateBackInStockSubscription;
}
