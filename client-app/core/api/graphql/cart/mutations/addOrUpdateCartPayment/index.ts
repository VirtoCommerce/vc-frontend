import client from "@core/api/graphql/graphql-client";
import { InputPaymentType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addOrUpdateCartPaymentMutation.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addOrUpdateCartPayment(payment: InputPaymentType): Promise<void> {
  const { data } = await client.mutate({
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
export default addOrUpdateCartPayment;
