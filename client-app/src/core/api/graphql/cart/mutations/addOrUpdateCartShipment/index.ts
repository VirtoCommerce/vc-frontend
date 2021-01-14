import client from "@core/api/graphql/graphql-client";
import { InputShipmentType } from "@core/api/graphql/types"
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from './addOrUpdateCartShipmentMutation.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addOrUpdateCartShipment(shipment: InputShipmentType): Promise<void> {

  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        shipment: shipment,
        storeId: storeId,
        userId: currentUserId
      }
    }
  });
}
export default addOrUpdateCartShipment;
