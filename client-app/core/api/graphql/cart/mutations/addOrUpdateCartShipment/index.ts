import client from "@core/api/graphql/graphql-client";
import { InputShipmentType } from "@core/api/graphql/types";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";

export default async function addOrUpdateCartShipment(shipment: InputShipmentType): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        shipment: shipment,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
