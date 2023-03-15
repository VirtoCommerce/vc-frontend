import mutationDocument from "./updateMemberAddressesMutation.graphql";
import type { InputMemberAddressType, Mutations, MutationsUpdateMemberAddressesArgs } from "@/xapi/types";

export default async function updateMemberAddresses(
  memberId: string,
  addresses: InputMemberAddressType[]
): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "updateMemberAddresses">>, MutationsUpdateMemberAddressesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
