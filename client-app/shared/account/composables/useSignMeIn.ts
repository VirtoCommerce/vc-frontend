import { syncRefs, useAsyncState } from "@vueuse/core";
import { ref, toValue } from "vue";
import { useGetMeQuery, useMergeCartMutation } from "@/core/api/graphql";
import { useAuth } from "@/core/composables";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart/composables";
import { useWhiteLabeling } from "./useWhiteLabeling";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import type { SignMeIn } from "@/shared/account/types";
import type { MaybeRefOrGetter } from "vue";

export function useSignMeIn(payload: MaybeRefOrGetter<SignMeIn>) {
  const { errors: authErrors, authorize } = useAuth();
  const broadcast = useBroadcast();
  const { cart } = useShortCart();
  const { result: me, load: getMe } = useGetMeQuery();
  const { mutate: mergeCart } = useMergeCartMutation();
  const { fetchWhiteLabeling } = useWhiteLabeling();

  const { isLoading: loading, execute: signIn } = useAsyncState(
    async () => {
      const { email, password } = toValue(payload);
      await authorize(email, password);

      await getMe();
      await mergeCart({ command: { userId: me.value!.me!.id, secondCartId: cart.value!.id } });

      if (me.value?.me?.contact?.organizationId) {
        fetchWhiteLabeling(me.value.me.contact.organizationId);
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
