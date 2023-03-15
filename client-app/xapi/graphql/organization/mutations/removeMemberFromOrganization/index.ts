import mutationDocument from "./removeMemberFromOrganization.graphql";
import type {
  InputRemoveMemberFromOrganizationType,
  Mutations,
  MutationsRemoveMemberFromOrganizationArgs,
} from "@/xapi/types";

export default async function removeMemberFromOrganization(
  payload: InputRemoveMemberFromOrganizationType
): Promise<void> {
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<
    Required<Pick<Mutations, "removeMemberFromOrganization">>,
    MutationsRemoveMemberFromOrganizationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
