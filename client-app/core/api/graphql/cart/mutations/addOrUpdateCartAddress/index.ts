import client from "@core/api/graphql/graphql-client";
import { InputAddressType, InputShipmentType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartAddressMutation.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addOrUpdateCartAddress(address: InputAddressType): Promise<void> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        address: address,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
export default addOrUpdateCartAddress;
