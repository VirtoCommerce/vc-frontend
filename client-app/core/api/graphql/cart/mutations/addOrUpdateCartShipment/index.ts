import client from "@core/api/graphql/graphql-client";
import { InputShipmentType, Mutations, MutationsAddOrUpdateCartShipmentArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";

export default async function addOrUpdateCartShipment(shipment: InputShipmentType): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addOrUpdateCartShipment">>, MutationsAddOrUpdateCartShipmentArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        shipment,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
