import { graphqlClient } from "../../../client";
import mutationDocument from "./changeOrganizationLogo.graphql";

export async function changeOrganizationLogo(organizationId: string, logoUrl: string): Promise<void> {
  await graphqlClient.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        organizationId,
        logoUrl,
      },
    },
  });
}
