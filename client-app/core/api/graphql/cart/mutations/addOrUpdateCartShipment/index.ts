import client from "@core/api/graphql/graphql-client";
import { InputShipmentType, Mutations, MutationsAddOrUpdateCartShipmentArgs } from "@core/api/graphql/types";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";
import globals from "@core/globals";

export default async function addOrUpdateCartShipment(shipment: InputShipmentType): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addOrUpdateCartShipment">>, MutationsAddOrUpdateCartShipmentArgs>({
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
