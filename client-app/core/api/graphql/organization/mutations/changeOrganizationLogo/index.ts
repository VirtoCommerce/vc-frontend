import { ChangeOrganizationLogoDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { Mutations, MutationsChangeOrganizationLogoArgs } from "@/core/api/graphql/types";

export async function changeOrganizationLogo(organizationId: string, logoUrl: string): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "changeOrganizationLogo">>, MutationsChangeOrganizationLogoArgs>({
    mutation: ChangeOrganizationLogoDocument,
    variables: {
      command: {
        organizationId,
        logoUrl,
      },
    },
  });
}
