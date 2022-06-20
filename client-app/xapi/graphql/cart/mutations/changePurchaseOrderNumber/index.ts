import { Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/xapi/graphql/types";
import mutationDocument from "./changePurchaseOrderNumber.graphql";
import globals from "@/core/globals";

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
