import { graphqlClient } from "../../../client";
import { UpdateMemberAddressesDocument } from "./updateMemberAddressesMutation.generated";
import type { InputMemberAddressType, Mutations, MutationsUpdateMemberAddressesArgs } from "@/core/api/graphql/types";

export async function updateMemberAddresses(memberId: string, addresses: InputMemberAddressType[]): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "updateMemberAddresses">>, MutationsUpdateMemberAddressesArgs>({
    mutation: UpdateMemberAddressesDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
