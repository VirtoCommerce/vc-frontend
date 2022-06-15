import client from "@core/api/graphql/graphql-client";
import { Mutations, MutationsValidateCouponArgs } from "@core/api/graphql/types";
import mutationDocument from "./validateCouponMutation.graphql";
import globals from "@core/globals";

export default async function validateCoupon(coupon: string): Promise<boolean> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.mutate<Required<Pick<Mutations, "validateCoupon">>, MutationsValidateCouponArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        coupon,
      },
    },
  });

  return data!.validateCoupon;
}
