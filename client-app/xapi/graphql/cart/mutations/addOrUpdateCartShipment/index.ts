import globals from "@/core/globals";
import { InputShipmentType, Mutations, MutationsAddOrUpdateCartShipmentArgs } from "@/xapi/types";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";

export default async function addOrUpdateCartShipment(shipment: InputShipmentType, cartId?: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<
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
}
