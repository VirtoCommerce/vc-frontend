import { useMutation } from "@/core/api/graphql/composables";
import { CreateConfiguredLineItemDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";

export function useCreateConfiguredLineItemMutation(
  configurableProductId: string,
  configuration: ConfigurationSectionInput[],
) {
  const { storeId, currencyCode, cultureName } = globals;
  return useMutation(CreateConfiguredLineItemDocument, {
    variables: {
      command: {
        cultureName,
        currencyCode,
        storeId,
        configurableProductId,
        configuration,
      },
    },
  });
}
