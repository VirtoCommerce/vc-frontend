import client from "@core/api/graphql/graphql-client";
import { CartType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getMyCartQueryDocument from "./getMyCartQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMyCart(): Promise<CartType> {
  const { data } = await client.query({
    query: getMyCartQueryDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale,
    },
  });
  return data.cart;
}
export default getMyCart;
