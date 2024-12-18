import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useChangeCartCurrencyMutation() {
  const { storeId, currencyCode, cultureName } = globals;
  return useMutation(ChangeCartCurrencyDocument, {
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName,
      },
    },
  });
}
