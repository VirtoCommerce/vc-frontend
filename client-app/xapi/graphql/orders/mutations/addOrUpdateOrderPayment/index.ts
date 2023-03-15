import mutationDocument from "./addOrUpdateOrderPaymentMutation.graphql";
import type { InputAddOrUpdateOrderPaymentType, Mutations, MutationsAddOrUpdateOrderPaymentArgs } from "@/xapi/types";

export default async function addOrUpdateOrderPayment(payload: InputAddOrUpdateOrderPaymentType): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<
    Required<Pick<Mutations, "addOrUpdateOrderPayment">>,
    MutationsAddOrUpdateOrderPaymentArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
