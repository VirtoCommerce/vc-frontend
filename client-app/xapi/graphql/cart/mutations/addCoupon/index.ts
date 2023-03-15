import globals from "@/core/globals";
import mutationDocument from "./addCouponMutation.graphql";
import type { Mutations, MutationsAddCouponArgs } from "@/xapi/types";

export default async function addCoupon(couponCode: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addCoupon">>, MutationsAddCouponArgs>({
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
