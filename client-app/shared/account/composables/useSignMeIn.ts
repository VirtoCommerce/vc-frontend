import { useMutation } from "@vue/apollo-composable";
import { syncRefs, useAsyncState } from "@vueuse/core";
import { ref } from "vue";
import { useGetMeQuery } from "@/core/api/graphql";
import { ChangeCartCurrencyDocument, ClearCartDocument, MergeCartDocument } from "@/core/api/graphql/types";
import { useAuth } from "@/core/composables/useAuth";
import { useCurrency } from "@/core/composables/useCurrency";
import { useLanguages } from "@/core/composables/useLanguages";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { globals } from "@/core/globals";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export function useSignMeIn() {
  const { errors: authErrors, resetErrors: resetAuthErrors } = useAuth();
  const broadcast = useBroadcast();
  const { cart } = useShortCart();
  const { result: me, load: loadMe, refetch: refetchMe } = useGetMeQuery();
  const { mutate: mergeCart } = useMutation(MergeCartDocument);
  const { unpinLocale, removeLocaleFromUrl } = useLanguages();
  const { supportedCurrencies, saveCurrencyCode } = useCurrency();
  const { mutate: changeCartCurrency } = useMutation(ChangeCartCurrencyDocument);
  const { currencyCode: currentCurrencyCode, storeId, cultureName } = globals;
  const { mutate: clearCurrencyCart } = useMutation(ClearCartDocument);

  const { isLoading: loading, execute } = useAsyncState(
    async (returnUrl?: string) => {
      localStorage.removeItem(USER_ID_LOCAL_STORAGE);

      unpinLocale();
      removeLocaleFromUrl();

      // get user that will be applied after reload.
      const firstLoad = loadMe();
      await (firstLoad === false ? refetchMe() : firstLoad);

      if (!me.value?.me) {
        throw new Error("The signed-in user could not be loaded");
      }

      const currencyCode = me.value?.me?.contact?.currencyCode;

      if (cart.value?.id && cart.value.items?.length) {
        if (currencyCode && currencyCode !== currentCurrencyCode) {
          await clearCurrencyCart({
            command: { userId: me.value.me.id, currencyCode: currentCurrencyCode, storeId, cultureName },
            skipQuery: false,
          });
        }

        // Ensure that the currency of the cart (secondCartId) matches the provided currencyCode
        await mergeCart({
          command: {
            userId: me.value.me.id,
            secondCartId: cart.value.id,
            storeId,
            cultureName,
            currencyCode: currentCurrencyCode,
          },
        });

        if (currencyCode && currencyCode !== currentCurrencyCode) {
          await changeCartCurrency({
            command: {
              userId: me.value.me.id,
              newCurrencyCode: currencyCode,
              storeId,
              cultureName,
              currencyCode: currentCurrencyCode,
            },
          });
        }
      }

      const contactCurrency = supportedCurrencies.value.find((item) => item.code === currencyCode);
      if (contactCurrency) {
        saveCurrencyCode(contactCurrency.code, false);
      }

      void broadcast.emit(openReturnUrl, returnUrl, TabsType.ALL);
    },
    null,
    { immediate: false, throwError: true },
  );

  const errors = ref<IdentityErrorType[]>();

  syncRefs(authErrors, errors);

  /** Without `returnUrl`, opens the `returnUrl` query of the current page or the store default. */
  async function signIn(options: { returnUrl?: string } = {}): Promise<void> {
    await execute(0, options.returnUrl);
  }

  function resetErrors() {
    resetAuthErrors();
    errors.value = [];
  }

  return {
    errors,
    loading,
    signIn,
    resetErrors,
  };
}
