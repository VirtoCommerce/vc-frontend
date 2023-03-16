import mutationDocument from "./updateOrganizationMutation.graphql";
import type {
  InputUpdateOrganizationType,
  Mutations,
  MutationsUpdateOrganizationArgs,
  Organization,
} from "@/xapi/types";

export default async function updateOrganization(payload: InputUpdateOrganizationType): Promise<Organization> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "updateOrganization">>,
    MutationsUpdateOrganizationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });

  return data!.updateOrganization;
}
