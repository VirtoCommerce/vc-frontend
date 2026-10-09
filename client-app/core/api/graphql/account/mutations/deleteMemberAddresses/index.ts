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
  });

  return data?.deleteMemberAddresses?.addresses?.items ?? [];
}
