import {
  AuthorizePaymentResultType,
  InputAuthorizePaymentType,
  Mutations,
  MutationsAuthorizePaymentArgs,
} from "@/xapi/graphql/types";
import mutationDocument from "./authorizePaymentMutation.graphql";

export default async function authorizePayment(
  payload: InputAuthorizePaymentType
): Promise<AuthorizePaymentResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "authorizePayment">>,
    MutationsAuthorizePaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.authorizePayment;
}
