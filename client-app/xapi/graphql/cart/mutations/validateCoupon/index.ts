import { Mutations, MutationsValidateCouponArgs } from "@/xapi/graphql/types";
import mutationDocument from "./validateCouponMutation.graphql";
import globals from "@core/globals";

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
