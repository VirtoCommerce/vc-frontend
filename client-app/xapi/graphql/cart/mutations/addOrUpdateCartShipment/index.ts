import { InputShipmentType, Mutations, MutationsAddOrUpdateCartShipmentArgs } from "@/xapi/graphql/types";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";
import globals from "@core/globals";

export default async function addOrUpdateCartShipment(shipment: InputShipmentType): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addOrUpdateCartShipment">>, MutationsAddOrUpdateCartShipmentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        shipment,
      },
    },
  });
}
