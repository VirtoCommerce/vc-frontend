import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./authorizePaymentMutation.graphql";
import type {
  AuthorizePaymentResultType,
  InputAuthorizePaymentType,
  Mutations,
  MutationsAuthorizePaymentArgs,
} from "@/core/api/graphql/types";

export async function authorizePayment(payload: InputAuthorizePaymentType): Promise<AuthorizePaymentResultType> {
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
      },
    },
  });

  return data!.authorizePayment;
}
