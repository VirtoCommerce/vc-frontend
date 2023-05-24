import globals from "@/core/globals";
import mutationDocument from "./changePurchaseOrderNumber.graphql";
import type { CartType, Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/xapi/types";

export async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "changePurchaseOrderNumber">>,
    MutationsChangePurchaseOrderNumberArgs
  >({
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

  return data!.changePurchaseOrderNumber;
}
