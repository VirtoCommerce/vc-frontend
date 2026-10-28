import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { graphqlClient } from "../../../client";
import mutationDocument from "./deleteMemberAddressesMutation.graphql";
import type {
  DeleteMemberAddressesMutation,
  DeleteMemberAddressesMutationVariables,
  InputMemberAddressType,
  MemberAddressType,
} from "@/core/api/graphql/types";

export async function deleteMemberAddresses(
  addresses: InputMemberAddressType[],
  memberId: string,
): Promise<MemberAddressType[]> {
  const { data } = await graphqlClient.mutate<DeleteMemberAddressesMutation, DeleteMemberAddressesMutationVariables>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
    // Every mounted address list (account page, header ship-to, checkout) shows the same address book.
    refetchQueries: () =>
      filterActiveQueryNames(graphqlClient, [
        OperationNames.Query.GetCurrentUserAddresses,
        OperationNames.Query.GetCurrentOrganizationAddresses,
      ]),
  });

  return data?.deleteMemberAddresses?.addresses?.items ?? [];
}
