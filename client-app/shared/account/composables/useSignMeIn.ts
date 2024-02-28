import { useAsyncState } from "@vueuse/core";
import { toValue } from "vue";
import { useGetMeQuery, useMergeCartMutation } from "@/core/api/graphql";
import { useAuth } from "@/core/composables";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart/composables";
import type { SignMeIn } from "@/shared/account/types";
import type { MaybeRefOrGetter } from "vue";

export function useSignMeIn(payload: MaybeRefOrGetter<SignMeIn>) {
  const { errors, authorize } = useAuth();
  const broadcast = useBroadcast();
  const { cart } = useShortCart();
  const { result: me, load: getMe } = useGetMeQuery();
  const { mutate: mergeCart } = useMergeCartMutation();

  const { isLoading: loading, execute: signIn } = useAsyncState(
    async () => {
      const { email, password } = toValue(payload);
      await authorize(email, password);

      await getMe();
      await mergeCart({ command: { userId: me.value!.me!.id, secondCartId: cart.value!.id } });

      broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
    },
    null,
    { immediate: false },
  );

  function reset() {}

  return {
    errors,
    loading,
    signIn,
    reset,
  };
}
