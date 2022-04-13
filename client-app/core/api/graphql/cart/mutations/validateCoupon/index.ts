import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import { Mutations, MutationsValidateCouponArgs } from "@core/api/graphql/types";
import mutationDocument from "./validateCouponMutation.graphql";

export default async function validateCoupon(coupon: string): Promise<boolean> {
  const { data } = await client.mutate<Required<Pick<Mutations, "validateCoupon">>, MutationsValidateCouponArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        coupon,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });

  return data!.validateCoupon;
}
