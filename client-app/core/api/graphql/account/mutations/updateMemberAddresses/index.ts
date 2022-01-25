import client from "@core/api/graphql/graphql-client";
import {
  InputPersonalDataType,
  IdentityResultType,
  InputMemberAddressType,
  MemberAddressType,
} from "@core/api/graphql/types";
import { currentUserId } from "@core/constants";
import mutationDocument from "./updateMemberAddressesMutation.graphql";

async function updateMemberAddresses(addresses: MemberAddressType[]): Promise<void> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        addresses,
        memberId: currentUserId,
      },
    },
  });
}
export default updateMemberAddresses;
