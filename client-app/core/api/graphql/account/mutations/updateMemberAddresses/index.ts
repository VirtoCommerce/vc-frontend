import client from "@core/api/graphql/graphql-client";
import {
  InputMemberAddressType,
  MemberAddressType,
  Mutations,
  MutationsUpdateMemberAddressesArgs,
} from "@core/api/graphql/types";
import { currentUserId } from "@core/constants";
import mutationDocument from "./updateMemberAddressesMutation.graphql";

async function updateMemberAddresses(addresses: InputMemberAddressType[]): Promise<MemberAddressType[]> {
  const { data } = await client.mutate<
    Required<Pick<Mutations, "updateMemberAddresses">>,
    MutationsUpdateMemberAddressesArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        addresses,
        memberId: currentUserId,
      },
    },
  });

  return data?.updateMemberAddresses?.addresses as MemberAddressType[];
}

export default updateMemberAddresses;
