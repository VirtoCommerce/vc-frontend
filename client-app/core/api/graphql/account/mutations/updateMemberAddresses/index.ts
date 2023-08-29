import { graphqlClient } from "../../../client";
import mutationDocument from "./updateMemberAddressesMutation.graphql";
import type { InputMemberAddressType, Mutations, MutationsUpdateMemberAddressesArgs } from "@/core/api/graphql/types";

export async function updateMemberAddresses(memberId: string, addresses: InputMemberAddressType[]): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateMemberAddresses">>, MutationsUpdateMemberAddressesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
