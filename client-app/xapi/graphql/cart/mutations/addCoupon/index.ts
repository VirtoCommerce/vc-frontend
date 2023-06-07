import globals from "@/core/globals";
import mutationDocument from "./addCouponMutation.graphql";
import type { CartType, Mutations, MutationsAddCouponArgs } from "@/xapi/types";

export async function addCoupon(couponCode: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "addCoupon">>, MutationsAddCouponArgs>({
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

  return data!.addCoupon;
}
