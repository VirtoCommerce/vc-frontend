import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import { IdentityResultType } from "@core/api/graphql/types";
import mutationDocument from "./validateCouponMutation.graphql";

export default async function validateCoupon(coupon: string): Promise<IdentityResultType> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        coupon: coupon,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
  return data?.validateCoupon;
}
