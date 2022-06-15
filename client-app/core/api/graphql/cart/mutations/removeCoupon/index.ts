import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./removeCouponMutation.graphql";
import { Mutations, MutationsRemoveCouponArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function removeCoupon(couponCode: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveCouponArgs>({
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
