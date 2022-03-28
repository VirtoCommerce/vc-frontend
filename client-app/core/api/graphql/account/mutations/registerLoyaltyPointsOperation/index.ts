import { Mutations, MutationsRegisterPointsOperationArgs } from "@core/api/graphql/types";
import { currentUserId, storeId } from "@core/constants";

import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./registerLoyaltyPointsOperationMutation.graphql";

export default async function registerLoyaltyPointsOperation(reason: string, amount: number): Promise<void> {
  await client.mutate<Pick<Mutations, "registerPointsOperation">, MutationsRegisterPointsOperationArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        userId: currentUserId,
        storeId,
        reason,
        amount: typeof amount === "string" ? parseInt(amount, 10) : 0,
      },
    },
  });
}
