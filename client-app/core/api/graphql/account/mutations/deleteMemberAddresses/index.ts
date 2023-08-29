import { graphqlClient } from "../../../client";
import mutationDocument from "./deleteMemberAddressesMutation.graphql";
import type { InputMemberAddressType, Mutations, MutationsDeleteMemberAddressesArgs } from "@/core/api/graphql/types";

export async function deleteMemberAddresses(addresses: InputMemberAddressType[], memberId: string): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "deleteMemberAddresses">>, MutationsDeleteMemberAddressesArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
