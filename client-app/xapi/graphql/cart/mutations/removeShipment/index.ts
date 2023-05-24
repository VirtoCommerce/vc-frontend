import globals from "@/core/globals";
import mutationDocument from "./removeShipmentMutation.graphql";
import type { CartType, Mutations, MutationsRemoveShipmentArgs } from "@/xapi/types";

export async function removeShipment(shipmentId: string, cartId?: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "removeShipment">>,
    MutationsRemoveShipmentArgs
  >({
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

  return data!.removeShipment;
}
