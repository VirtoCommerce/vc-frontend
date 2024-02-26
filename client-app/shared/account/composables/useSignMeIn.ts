import { computed } from "vue";
import { useFetch } from "@/core/api/common";
import { useGetMeQuery, useMergeCartMutation } from "@/core/api/graphql";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart/composables";
import type { IdentityResultType } from "@/core/api/graphql/types";
import type { SignMeIn } from "@/shared/account/types";
import type { AfterFetchContext } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

export function useSignMeIn(payload: MaybeRefOrGetter<SignMeIn>) {
  const broadcast = useBroadcast();
  const { cart } = useShortCart();
  const { result: me, load: getMe, loading: getMeLoading } = useGetMeQuery();
  const { mutate: mergeCart, loading: mergeCartLoading } = useMergeCartMutation();

  const {
    data,
    isFetching,
    execute: signIn,
  } = useFetch("/storefrontapi/account/login", { immediate: false, afterFetch })
    .post(payload)
    .json<IdentityResultType>();

  async function afterFetch(context: AfterFetchContext<IdentityResultType>) {
    if (context.data?.succeeded) {
      await getMe();
      await mergeCart({ command: { userId: me.value!.me!.id, secondCartId: cart.value!.id } });
      broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
    }
    return context;
  }

  function reset() {
    data.value = null;
  }

  return {
    errors: computed(() => data.value?.errors),
    loading: computed(() => isFetching.value || getMeLoading.value || mergeCartLoading.value),
    signIn,
    reset,
  };
}
