import globals from "@/core/globals";
import mutationDocument from "./removeCouponMutation.graphql";
import type { CartType, Mutations, MutationsRemoveCouponArgs } from "@/xapi/types";

export async function removeCoupon(couponCode: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveCouponArgs>({
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

  return data!.removeCoupon;
}
