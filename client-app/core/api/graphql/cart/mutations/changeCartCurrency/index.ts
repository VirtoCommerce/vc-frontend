import { computed } from "vue";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useChangeCartCurrencyMutation() {
  return useMutation(
    ChangeCartCurrencyDocument,
    computed(() => {
      const { storeId, currencyCode, cultureName } = globals;

      return {
        variables: {
          command: {
            storeId,
            currencyCode,
            cultureName,
          },
        },
      };
    }),
  );
}
