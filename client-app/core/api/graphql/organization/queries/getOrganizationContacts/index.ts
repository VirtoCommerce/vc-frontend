import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getOrganizationContactsQueryDocument from "./getOrganizationContactsQuery.graphql";
import type {
  ContactConnection,
  OrganizationContactsArgs,
  Query,
  QueryOrganizationArgs,
} from "@/core/api/graphql/types";

export async function getOrganizationContacts(
  organizationId: string,
  payload: OrganizationContactsArgs,
): Promise<ContactConnection> {
  const { userId } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "organization">>,
    QueryOrganizationArgs & OrganizationContactsArgs
  >({
    query: getOrganizationContactsQueryDocument,
    variables: {
      id: organizationId,
      userId,
      ...payload,
    },
  });

  return data.organization.contacts!;
}
