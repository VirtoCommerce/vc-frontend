import client from "@core/api/graphql/graphql-client";
import { InputMemberAddressType, Mutations, MutationsUpdateMemberAddressesArgs } from "@core/api/graphql/types";
import mutationDocument from "./updateMemberAddressesMutation.graphql";

export default async function updateMemberAddresses(
  memberId: string,
  addresses: InputMemberAddressType[]
): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "updateMemberAddresses">>, MutationsUpdateMemberAddressesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
