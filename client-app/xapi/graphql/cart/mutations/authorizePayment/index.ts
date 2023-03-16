import mutationDocument from "./authorizePaymentMutation.graphql";
import type {
  AuthorizePaymentResultType,
  InputAuthorizePaymentType,
  Mutations,
  MutationsAuthorizePaymentArgs,
} from "@/xapi/types";

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
