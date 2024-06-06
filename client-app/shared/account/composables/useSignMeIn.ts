import { syncRefs, useAsyncState } from "@vueuse/core";
import { ref, toValue } from "vue";
import { useGetMeQuery, useMergeCartMutation } from "@/core/api/graphql";
import { useCurrency, useLanguages } from "@/core/composables";
import { useAuth } from "@/core/composables/useAuth";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart/composables";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { SignMeIn } from "@/shared/account/types";
import type { MaybeRefOrGetter } from "vue";

export function useSignMeIn(payload: MaybeRefOrGetter<SignMeIn>) {
  const { errors: authErrors, authorize } = useAuth();
  const broadcast = useBroadcast();
  const { cart } = useShortCart();
  const { result: me, load: getMe } = useGetMeQuery();
  const { mutate: mergeCart } = useMergeCartMutation();
  const { supportedLanguages, saveLocaleAndReload } = useLanguages();
  const { supportedCurrencies, saveCurrencyCodeAndReload } = useCurrency();

  const { isLoading: loading, execute: signIn } = useAsyncState(
    async () => {
      const { email, password } = toValue(payload);
      await authorize(email, password);

      await getMe();
      await mergeCart({ command: { userId: me.value!.me!.id, secondCartId: cart.value!.id } });

      if (me.value?.me?.contact?.defaultLanguage) {
        const contactLanguage = supportedLanguages.value.find(
          (item) => item.cultureName === me.value!.me!.contact!.defaultLanguage,
        );

        if (contactLanguage) {
          saveLocaleAndReload(contactLanguage.twoLetterLanguageName);
        }
      }

      if (me.value?.me?.contact?.currencyCode) {
        const contactCurrency = supportedCurrencies.value.find(
          (item) => item.code === me.value!.me!.contact!.currencyCode,
        );

        if (contactCurrency) {
          saveCurrencyCodeAndReload(contactCurrency.code);
        }
      }

      broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
    },
    null,
    { immediate: false },
  );

  const errors = ref<IdentityErrorType[]>();

  syncRefs(authErrors, errors);

  function resetErrors() {
    errors.value = [];
  }

  return {
    errors,
    loading,
    signIn,
    resetErrors,
  };
}
