import { GetOrganizationOrdersDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { QueryOrganizationOrdersArgs } from "@/core/api/graphql/types";

export async function getOrganizationOrders(payload?: QueryOrganizationOrdersArgs) {
  const { cultureName, organizationId } = globals;

  const { data } = await graphqlClient.query({
    query: GetOrganizationOrdersDocument,
    variables: {
      cultureName,
      organizationId,
      ...payload,
    },
  });

  return data.organizationOrders;
}
