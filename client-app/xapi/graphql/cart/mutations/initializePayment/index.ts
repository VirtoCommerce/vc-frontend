import mutationDocument from "./initializePaymentMutation.graphql";
import type {
  InitializePaymentResultType,
  InputInitializePaymentType,
  Mutations,
  MutationsInitializePaymentArgs,
} from "@/xapi/types";

export default async function initializePayment(
  payload: InputInitializePaymentType
): Promise<InitializePaymentResultType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "initializePayment">>,
    MutationsInitializePaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.initializePayment;
}
