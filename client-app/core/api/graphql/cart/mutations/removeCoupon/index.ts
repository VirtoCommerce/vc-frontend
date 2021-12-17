import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./removeCouponMutation.graphql";

export default async function removeCoupon(couponCode: string): Promise<void> {
  const { data } = await client.mutate({
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
