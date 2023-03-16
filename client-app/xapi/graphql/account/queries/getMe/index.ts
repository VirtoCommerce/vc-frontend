import getMeQueryDocument from "./getMeQuery.graphql";
import type { ContactTypeOrganizationsArgs, Query, UserType } from "@/xapi/types";

export default async function getMe(): Promise<UserType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeOrganizationsArgs>({
    query: getMeQueryDocument,
  });

  return data.me;
}
