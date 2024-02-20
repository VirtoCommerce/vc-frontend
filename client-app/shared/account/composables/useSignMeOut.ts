import { useApolloClient } from "@vue/apollo-composable";
import { useFetch } from "@/core/api/common";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";
import type { AfterFetchContext } from "@vueuse/core";

export function useSignMeOut(options: { reloadPage?: boolean } = { reloadPage: true }) {
  const { resolveClient } = useApolloClient();
  const broadcast = useBroadcast();

  const { execute: signMeOut } = useFetch("/storefrontapi/account/logout", {
    immediate: false,
    afterFetch,
  }).get();

  async function afterFetch(context: AfterFetchContext) {
    await resolveClient().cache.reset();
    if (options.reloadPage) {
      broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
    }
    return context;
  }

  return {
    signMeOut,
  };
}
