import { Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";

import mutationDocument from "./changePurchaseOrderNumber.graphql";

export default async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
  const { data } = await client.mutate<
    Pick<Mutations, "changePurchaseOrderNumber">,
    MutationsChangePurchaseOrderNumberArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        purchaseOrderNumber: purchaseOrderNumber,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
