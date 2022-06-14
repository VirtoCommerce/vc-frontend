import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addCouponMutation.graphql";
import { Mutations, MutationsAddCouponArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function addCoupon(couponCode: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addCoupon">>, MutationsAddCouponArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        couponCode,
      },
    },
  });
}
