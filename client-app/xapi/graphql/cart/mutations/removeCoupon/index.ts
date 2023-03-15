import globals from "@/core/globals";
import mutationDocument from "./removeCouponMutation.graphql";
import type { Mutations, MutationsRemoveCouponArgs } from "@/xapi/types";

export default async function removeCoupon(couponCode: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveCouponArgs>({
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
