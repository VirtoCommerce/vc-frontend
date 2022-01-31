import client from "@core/api/graphql/graphql-client";
import { ContactType } from "@core/api/graphql/types";
import getMyAddressesQueryDocument from "./getMyAddressesQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMyAddresses(sort: string): Promise<ContactType> {
  const { data } = await client.query({
    query: getMyAddressesQueryDocument,
    variables: {
      command: {
        sort: sort,
      },
    },
  });

  return data!.me!.contact!;
}
export default getMyAddresses;
