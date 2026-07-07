import { useApolloClient } from "@vue/apollo-composable";
import { useAuth } from "@/core/composables/useAuth";
import { useLanguages } from "@/core/composables/useLanguages";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";

export function useSignMeOut(options: { reloadPage?: boolean } = { reloadPage: true }) {
  const { client } = useApolloClient();
  const broadcast = useBroadcast();
  const { removeLocaleFromUrl, removeFacetsFromUrl, unpinLocale } = useLanguages();

  const { unauthorize } = useAuth();

  async function signMeOut() {
    await unauthorize();

    await client.clearStore();

    unpinLocale();
    removeLocaleFromUrl();
    removeFacetsFromUrl();

    localStorage.removeItem("currency");
    localStorage.removeItem(USER_ID_LOCAL_STORAGE);

    if (options.reloadPage) {
      void broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
    }
  }

  return {
    signMeOut,
  };
}
