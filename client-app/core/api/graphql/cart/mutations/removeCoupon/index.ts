import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./removeCouponMutation.graphql";
import type { CartType, Mutations, MutationsRemoveCouponArgs } from "@/core/api/graphql/types";

export async function removeCoupon(couponCode: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveCouponArgs>({
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
