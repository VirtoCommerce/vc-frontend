import globals from "@/core/globals";
import mutationDocument from "./validateCouponMutation.graphql";
import type { Mutations, MutationsValidateCouponArgs } from "@/xapi/types";

export default async function validateCoupon(coupon: string): Promise<boolean> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "validateCoupon">>,
    MutationsValidateCouponArgs
  >({
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
