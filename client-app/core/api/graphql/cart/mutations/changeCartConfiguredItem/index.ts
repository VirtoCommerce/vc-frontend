import { toValue } from "vue";
import { useAllGlobalVariables, useMutation } from "@/core/api/graphql/composables";
import { ChangeCartConfiguredItemDocument } from "@/core/api/graphql/types";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";

type MutationVariablesType = {
  lineItemId: string;
  configurationSections: ConfigurationSectionInput[];
  quantity: number;
};

export function useChangeCartConfiguredItemMutation() {
  const { cultureName, currencyCode, storeId, userId } = toValue(useAllGlobalVariables());

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
