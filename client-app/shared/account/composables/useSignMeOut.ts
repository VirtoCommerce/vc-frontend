import { useApolloClient } from "@vue/apollo-composable";
import { useAuth } from "@/core/composables";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";

export function useSignMeOut(options: { reloadPage?: boolean } = { reloadPage: true }) {
  const { client } = useApolloClient();
  const broadcast = useBroadcast();

  const { unauthorize } = useAuth();

  async function signMeOut() {
    await unauthorize();

    await client.resetStore();

    if (options.reloadPage) {
      broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
    }
  }

  return {
    signMeOut,
  };
}
