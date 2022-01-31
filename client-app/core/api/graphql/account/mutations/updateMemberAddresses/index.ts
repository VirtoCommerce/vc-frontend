import client from "@core/api/graphql/graphql-client";
import {
  InputMemberAddressType,
  MemberAddressType,
  Mutations,
  MutationsUpdateMemberAddressesArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./updateMemberAddressesMutation.graphql";

async function updateMemberAddresses(
  memberId: string,
  addresses: InputMemberAddressType[]
): Promise<MemberAddressType[]> {
  const { data } = await client.mutate<
    Required<Pick<Mutations, "updateMemberAddresses">>,
    MutationsUpdateMemberAddressesArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        memberId,
        addresses,
      },
    },
  });

  return data!.updateMemberAddresses.addresses!;
}

export default updateMemberAddresses;
