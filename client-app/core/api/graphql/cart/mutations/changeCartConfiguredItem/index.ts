import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartConfiguredItemDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";

export function useChangeCartConfiguredItemMutation() {
  const { storeId, currencyCode, cultureName, userId } = globals;

  const { mutate: _mutate, loading, called, onDone, onError, error } = useMutation(ChangeCartConfiguredItemDocument);

  async function mutate({
    lineItemId,
    configurationSections,
    quantity,
  }: {
    lineItemId: string;
    configurationSections: ConfigurationSectionInput[];
    quantity: number;
  }) {
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

  return { mutate, loading, called, onDone, onError, error };
}
