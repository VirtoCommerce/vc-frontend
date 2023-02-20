import globals from "@/core/globals";
import { Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/xapi/types";
import mutationDocument from "./changePurchaseOrderNumber.graphql";

export default async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Pick<Mutations, "changePurchaseOrderNumber">, MutationsChangePurchaseOrderNumberArgs>({
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
