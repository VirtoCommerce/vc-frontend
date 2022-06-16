import { InputMemberAddressType, Mutations, MutationsDeleteMemberAddressesArgs } from "@/xapi/graphql/types";
import mutationDocument from "./deleteMemberAddressesMutation.graphql";

export default async function deleteMemberAddresses(
  addresses: InputMemberAddressType[],
  memberId: string
): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "deleteMemberAddresses">>, MutationsDeleteMemberAddressesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
