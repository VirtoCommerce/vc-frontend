import { syncRefs, useAsyncState } from "@vueuse/core";
import { ref, toValue } from "vue";
import { useGetMeQuery, useMergeCartMutation } from "@/core/api/graphql";
import { useAuth } from "@/core/composables/useAuth";
import { useCurrency } from "@/core/composables/useCurrency";
import { useLanguages } from "@/core/composables/useLanguages";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
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
  const { unpinLocale, removeLocaleFromUrl } = useLanguages();
  const { supportedCurrencies, saveCurrencyCode } = useCurrency();

  const { isLoading: loading, execute: signIn } = useAsyncState(
    async () => {
      const { email, password } = toValue(payload);
      await authorize(email, password);
      localStorage.removeItem(USER_ID_LOCAL_STORAGE);

      await getMe();
      await mergeCart({ command: { userId: me.value!.me!.id, secondCartId: cart.value!.id } });

      unpinLocale();
      removeLocaleFromUrl();

      if (me.value?.me?.contact?.currencyCode) {
        const contactCurrency = supportedCurrencies.value.find(
          (item) => item.code === me.value!.me!.contact!.currencyCode,
        );

        if (contactCurrency) {
          saveCurrencyCode(contactCurrency.code, false);
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
