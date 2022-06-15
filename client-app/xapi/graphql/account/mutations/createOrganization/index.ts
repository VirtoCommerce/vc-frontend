import {
  Organization,
  InputCreateOrganizationType,
  Mutations,
  MutationsCreateOrganizationArgs,
} from "@/xapi/graphql/types";
import mutationDocument from "./createOrganization.graphql";

export default async function createOrganization(organization: InputCreateOrganizationType): Promise<Organization> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "createOrganization">>,
    MutationsCreateOrganizationArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: organization,
    },
  });

  return data!.createOrganization;
}
