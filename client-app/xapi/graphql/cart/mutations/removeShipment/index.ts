import globals from "@/core/globals";
import mutationDocument from "./removeShipmentMutation.graphql";
import type { Mutations, MutationsRemoveShipmentArgs } from "@/xapi/types";

export default async function removeCoupon(shipmentId: string, cartId?: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveShipmentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartId,
        shipmentId,
      },
    },
  });
}
