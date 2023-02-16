import globals from "@/core/globals";
import { Mutations, MutationsValidateCouponArgs } from "@/xapi/types";
import mutationDocument from "./validateCouponMutation.graphql";

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
