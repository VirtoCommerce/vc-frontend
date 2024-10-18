import { graphqlClient } from "../../../client";
import mutationDocument from "./activateBackInStockSubscription.graphql";
import type {
  ActivateBackInStockSubscriptionCommandType,
  BackInStockSubscriptionType,
  Mutations,
  MutationsActivateBackInStockSubscriptionArgs,
} from "@/core/api/graphql/types";

export async function activateBackInStockSubscription(
  payload: ActivateBackInStockSubscriptionCommandType,
): Promise<Promise<BackInStockSubscriptionType | undefined>> {
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
