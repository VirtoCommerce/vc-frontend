import globals from "@/core/globals";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";
import type { CartType, InputShipmentType, Mutations, MutationsAddOrUpdateCartShipmentArgs } from "@/xapi/types";

export async function addOrUpdateCartShipment(shipment: InputShipmentType, cartId?: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "addOrUpdateCartShipment">>,
    MutationsAddOrUpdateCartShipmentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartId,
        shipment,
      },
    },
  });

  return data!.addOrUpdateCartShipment;
}
