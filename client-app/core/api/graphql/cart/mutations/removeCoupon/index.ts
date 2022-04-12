import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./removeCouponMutation.graphql";
import { Mutations, MutationsRemoveCouponArgs } from "@core/api/graphql/types";

export default async function removeCoupon(couponCode: string): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "removeCoupon">>, MutationsRemoveCouponArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        couponCode,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
