import { graphqlClient } from "../../../client";
import mutationDocument from "./changeOrganizationLogo.graphql";
import type { Mutations, MutationsChangeOrganizationLogoArgs } from "@/core/api/graphql/types";

export async function changeOrganizationLogo(organizationId: string, logoUrl: string): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "changeOrganizationLogo">>, MutationsChangeOrganizationLogoArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        organizationId,
        logoUrl,
      },
    },
  });
}
