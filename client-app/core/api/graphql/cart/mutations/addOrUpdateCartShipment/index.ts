import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addOrUpdateCartShipmentMutation.graphql";
import type {
  CartType,
  InputShipmentType,
  Mutations,
  MutationsAddOrUpdateCartShipmentArgs,
} from "@/core/api/graphql/types";

export async function addOrUpdateCartShipment(shipment: InputShipmentType, cartId?: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
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
