import { Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/core/api/graphql/types";
import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./changePurchaseOrderNumber.graphql";
import globals from "@core/globals";

export default async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Pick<Mutations, "changePurchaseOrderNumber">, MutationsChangePurchaseOrderNumberArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        purchaseOrderNumber,
      },
    },
  });
}
