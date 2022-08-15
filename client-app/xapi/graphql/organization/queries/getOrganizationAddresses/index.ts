import globals from "@/core/globals";
import { MemberAddressConnection, OrganizationAddressesArgs, Query, QueryOrganizationArgs } from "@/xapi/types";
import queryDocument from "./getOrganizationAddressesQuery.graphql";

export default async function getOrganizationAddresses(
  organizationId: string,
  payload?: OrganizationAddressesArgs
): Promise<MemberAddressConnection> {
  const { $graphqlClient } = useNuxtApp();
  const { userId } = globals;

  const { data } = await $graphqlClient.query<
    Required<Pick<Query, "organization">>,
    QueryOrganizationArgs & OrganizationAddressesArgs
  >({
    query: queryDocument,
    variables: {
      userId,
      id: organizationId,
      ...payload,
    },
  });

  return data.organization.addresses!;
}
