import client from "@core/api/graphql/graphql-client";
import {
  AuthorizePaymentResultType,
  InputAuthorizePaymentType,
  Mutations,
  MutationsAuthorizePaymentArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./authorizePaymentMutation.graphql";

export default async function authorizePayment(
  payload: InputAuthorizePaymentType
): Promise<AuthorizePaymentResultType> {
  const { data } = await client.mutate<Required<Pick<Mutations, "authorizePayment">>, MutationsAuthorizePaymentArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.authorizePayment;
}
