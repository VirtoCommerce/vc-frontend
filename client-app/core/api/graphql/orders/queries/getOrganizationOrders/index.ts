import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getOrganizationOrdersQueryDocument from "./getOrganizationOrdersQuery.graphql";
import type { CustomerOrderConnection, Query, QueryOrganizationOrdersArgs } from "@/core/api/graphql/types";

export async function getOrganizationOrders(payload?: QueryOrganizationOrdersArgs): Promise<CustomerOrderConnection> {
  const { cultureName, organizationId } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "organizationOrders">>, QueryOrganizationOrdersArgs>({
    query: getOrganizationOrdersQueryDocument,
    variables: {
      cultureName,
      organizationId,
      ...payload,
    },
  });

  return data.organizationOrders;
}
