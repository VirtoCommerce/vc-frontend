import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { apolloClient, graphqlClient } from "../../../client";
import mutationDocument from "./updateMemberAddressesMutation.graphql";
import type {
  InputMemberAddressType,
  MemberAddressType,
  UpdateMemberAddressesMutation,
  UpdateMemberAddressesMutationVariables,
} from "@/core/api/graphql/types";

const ADDRESS_LIST_QUERIES = [
  OperationNames.Query.GetCurrentUserAddresses,
  OperationNames.Query.GetCurrentOrganizationAddresses,
];

export async function updateMemberAddresses(
  memberId: string,
  addresses: InputMemberAddressType[],
): Promise<MemberAddressType[]> {
  const { data } = await graphqlClient.mutate<UpdateMemberAddressesMutation, UpdateMemberAddressesMutationVariables>({
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

  return data?.updateMemberAddresses?.addresses?.items ?? [];
}
