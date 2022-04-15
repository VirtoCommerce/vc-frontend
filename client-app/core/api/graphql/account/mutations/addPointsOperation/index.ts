import { Mutations, MutationsAddPointsArgs } from "@core/api/graphql/types";
import { currentUserId, storeId } from "@core/constants";

import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addPointsOperationMutation.graphql";

export default async function addPointsOperationMutation(reason: string, amount: number): Promise<void> {
  await client.mutate<Pick<Mutations, "addPoints">, MutationsAddPointsArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        userId: currentUserId,
        storeId,
        reason,
        amount: parseFloat(amount.toString()),
      },
    },
  });
}
