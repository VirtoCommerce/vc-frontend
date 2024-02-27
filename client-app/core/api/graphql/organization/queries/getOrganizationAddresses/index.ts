import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetOrganizationAddressesDocument } from "./getOrganizationAddressesQuery.generated";
import type {
  MemberAddressConnection,
  OrganizationAddressesArgs,
  Query,
  QueryOrganizationArgs,
} from "@/core/api/graphql/types/base.generated";

export async function getOrganizationAddresses(
  organizationId: string,
  payload?: OrganizationAddressesArgs,
): Promise<MemberAddressConnection> {
  const { userId } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "organization">>,
    QueryOrganizationArgs & OrganizationAddressesArgs
  >({
    query: GetOrganizationAddressesDocument,
    variables: {
      userId,
      id: organizationId,
      ...payload,
    },
  });

  return data.organization.addresses!;
}
