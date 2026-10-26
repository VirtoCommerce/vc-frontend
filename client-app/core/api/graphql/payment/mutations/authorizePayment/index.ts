import { globals } from "@/core/globals";
import {
  forgetStoredCredentialIntent,
  rememberStoredCredentialIntent,
  withStoredCredentialIntent,
} from "@/shared/payment/utils/stored-credential-intent";
import { graphqlClient } from "../../../client";
import mutationDocument from "./authorizePaymentMutation.graphql";
import type {
  AuthorizePaymentResultType,
  InputAuthorizePaymentType,
  Mutations,
  MutationsAuthorizePaymentArgs,
} from "@/core/api/graphql/types";

/**
 * Authorizes an order's payment. The customer's card choice (save the card, under which consent) is remembered for the
 * order and sent again when the payment comes back from the provider's page or a 3-D Secure redirect without it.
 */
export async function authorizePayment(payload: InputAuthorizePaymentType): Promise<AuthorizePaymentResultType> {
  const orderId = payload.orderId ?? undefined;
  if (orderId) {
    rememberStoredCredentialIntent(orderId, payload.parameters);
  }

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "authorizePayment">>,
    MutationsAuthorizePaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId: globals.storeId,
        cultureName: globals.cultureName,
        ...payload,
        parameters: withStoredCredentialIntent(orderId, payload.parameters),
      },
    },
  });

  if (orderId && data?.authorizePayment.isSuccess) {
    forgetStoredCredentialIntent(orderId);
  }

  return data!.authorizePayment;
}
