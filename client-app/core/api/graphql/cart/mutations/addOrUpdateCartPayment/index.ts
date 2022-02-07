import client from "@core/api/graphql/graphql-client";
import { InputPaymentType } from "@core/api/graphql/types";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";

export default async function addOrUpdateCartPayment(payment: InputPaymentType): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        payment: payment,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
