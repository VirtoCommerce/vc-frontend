import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { graphqlClient } from "../../../client";
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
    // Every mounted address list (account page, header ship-to, checkout) shows the same address book.
    refetchQueries: () =>
      filterActiveQueryNames(graphqlClient, [
        OperationNames.Query.GetCurrentUserAddresses,
        OperationNames.Query.GetCurrentOrganizationAddresses,
      ]),
  });

  return data?.updateMemberAddresses?.addresses?.items ?? [];
}
