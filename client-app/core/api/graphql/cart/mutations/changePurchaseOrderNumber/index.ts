import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./changePurchaseOrderNumber.graphql";
import type { CartType, Mutations, MutationsChangePurchaseOrderNumberArgs } from "@/core/api/graphql/types";

export async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
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
