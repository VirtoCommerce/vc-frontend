import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addCouponMutation.graphql";

export default async function addCoupon(couponCode: string): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        couponCode: couponCode,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
