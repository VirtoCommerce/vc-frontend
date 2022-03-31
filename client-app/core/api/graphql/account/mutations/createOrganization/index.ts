import client from "@core/api/graphql/graphql-client";
import {
  Organization,
  InputCreateOrganizationType,
  Mutations,
  MutationsCreateOrganizationArgs,
} from "@core/api/graphql/types";
import mutationDocument from "./createOrganization.graphql";

export default async function createOrganization(organization: InputCreateOrganizationType): Promise<Organization> {
  const { data } = await client.mutate<Pick<Mutations, "createOrganization">, MutationsCreateOrganizationArgs>({
    mutation: mutationDocument,
    variables: {
      command: organization,
    },
  });

  return data?.createOrganization as Organization;
}
