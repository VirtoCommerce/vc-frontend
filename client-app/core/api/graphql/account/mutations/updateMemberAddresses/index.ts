import { graphqlClient } from "../../../client";
import mutationDocument from "./updateMemberAddressesMutation.graphql";
import type {
  InputMemberAddressType,
  MemberAddressType,
  UpdateMemberAddressesMutation,
  UpdateMemberAddressesMutationVariables,
} from "@/core/api/graphql/types";

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

  return data?.updateMemberAddresses?.addresses?.items ?? [];
}
