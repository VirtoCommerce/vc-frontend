import { InputMemberAddressType, Mutations, MutationsUpdateMemberAddressesArgs } from "@/xapi/graphql/types";
import mutationDocument from "./updateMemberAddressesMutation.graphql";

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
