import { useApolloClient } from "@vue/apollo-composable";
import { useAuth } from "@/core/composables/useAuth";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";

export function useSignMeOut(options: { reloadPage?: boolean } = { reloadPage: true }) {
  const { client } = useApolloClient();
  const broadcast = useBroadcast();

  const { unauthorize } = useAuth();

  async function signMeOut() {
    await unauthorize();

    await client.clearStore();

    localStorage.removeItem("locale");
    localStorage.removeItem("currency");

    if (options.reloadPage) {
      broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
    }
  }

  return {
    signMeOut,
  };
}
