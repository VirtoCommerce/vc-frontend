import { useApolloClient } from "@vue/apollo-composable";
import { useAuth } from "@/core/composables/useAuth";
import { useLanguages } from "@/core/composables/useLanguages";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";

export function useSignMeOut(options: { reloadPage?: boolean } = { reloadPage: true }) {
  const { client } = useApolloClient();
  const broadcast = useBroadcast();
  const { removeLocaleFromUrl, unpinLocale } = useLanguages();

  const { unauthorize } = useAuth();

  async function signMeOut() {
    await unauthorize();

    await client.clearStore();

    unpinLocale();
    removeLocaleFromUrl();

    localStorage.removeItem("currency");

    if (options.reloadPage) {
      broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
    }
  }

  return {
    signMeOut,
  };
}
