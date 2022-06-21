import { ContactTypeOrganizationsArgs, Query, UserType } from "@/xapi/graphql/types";
import getMeQueryDocument from "./getMeQuery.graphql";

export default async function getMe(): Promise<UserType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "me">>, ContactTypeOrganizationsArgs>({
    query: getMeQueryDocument,
  });

  return data.me;
}
