import { ContactConnection, OrganizationContactsArgs, Query, QueryOrganizationArgs } from "@/xapi/types";
import getOrganizationContactsQueryDocument from "./getOrganizationContactsQuery.graphql";
import globals from "@/core/globals";

export default async function getOrganizationContacts(
  organizationId: string,
  payload: OrganizationContactsArgs
): Promise<ContactConnection> {
  const { userId } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
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
