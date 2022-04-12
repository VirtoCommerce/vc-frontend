import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addCouponMutation.graphql";
import { Mutations, MutationsAddCouponArgs } from "@core/api/graphql/types";

export default async function addCoupon(couponCode: string): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addCoupon">>, MutationsAddCouponArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        couponCode,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
