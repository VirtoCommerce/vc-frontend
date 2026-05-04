import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { apolloClient, graphqlClient } from "../../../client";
import mutationDocument from "./deleteMemberAddressesMutation.graphql";
import type {
  DeleteMemberAddressesMutation,
  DeleteMemberAddressesMutationVariables,
  InputMemberAddressType,
  MemberAddressType,
} from "@/core/api/graphql/types";

const ADDRESS_LIST_QUERIES = [
  OperationNames.Query.GetCurrentUserAddresses,
  OperationNames.Query.GetCurrentOrganizationAddresses,
];

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
  });

  await apolloClient.refetchQueries({
    include: filterActiveQueryNames(apolloClient, ADDRESS_LIST_QUERIES),
  });

  return data?.deleteMemberAddresses?.addresses?.items ?? [];
}
