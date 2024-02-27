import { graphqlClient } from "../../../client";
import { DeleteMemberAddressesDocument } from "./deleteMemberAddressesMutation.generated";
import type { InputMemberAddressType, Mutations, MutationsDeleteMemberAddressesArgs } from "@/core/api/graphql/types";

export async function deleteMemberAddresses(addresses: InputMemberAddressType[], memberId: string): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "deleteMemberAddresses">>, MutationsDeleteMemberAddressesArgs>({
    mutation: DeleteMemberAddressesDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });
}
