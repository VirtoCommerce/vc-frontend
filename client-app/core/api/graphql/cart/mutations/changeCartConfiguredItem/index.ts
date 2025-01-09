import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartConfiguredItemDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";

type MutationVariablesType = {
  lineItemId: string;
  configurationSections: ConfigurationSectionInput[];
  quantity?: number;
};

export function useChangeCartConfiguredItemMutation() {
  const { storeId, cultureName, currencyCode, userId } = globals;

  const { mutate: _mutate, ...rest } = useMutation(ChangeCartConfiguredItemDocument);

  async function mutate({ lineItemId, configurationSections, quantity }: MutationVariablesType) {
    return await _mutate({
      command: {
        storeId,
        cultureName,
        currencyCode,
        userId,
        lineItemId,
        configurationSections,
        quantity,
      },
    });
  }

  return { mutate, ...rest };
}
