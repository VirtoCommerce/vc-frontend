import { graphqlClient } from "../../../client";
import { refetchAddressBooks } from "../refetchAddressBooks";
import mutationDocument from "./updateMemberAddressesMutation.graphql";
import type { ErrorNotificationsContextType } from "@/core/api/graphql/consts";
import type {
  InputMemberAddressType,
  MemberAddressType,
  UpdateMemberAddressesMutation,
  UpdateMemberAddressesMutationVariables,
} from "@/core/api/graphql/types";

export async function updateMemberAddresses(
  memberId: string,
  addresses: InputMemberAddressType[],
  context?: ErrorNotificationsContextType,
): Promise<MemberAddressType[]> {
  const { data } = await graphqlClient.mutate<UpdateMemberAddressesMutation, UpdateMemberAddressesMutationVariables>({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
    context,
  });

  refetchAddressBooks();

  return data?.updateMemberAddresses?.addresses?.items ?? [];
}
