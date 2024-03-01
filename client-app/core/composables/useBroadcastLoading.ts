import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

export function useBroadcastLoading(key: string) {
  const state = useLocalStorage("loading", { [key]: false }, { mergeDefaults: true });

  return computed({ get: () => state.value[key], set: (value: boolean) => (state.value[key] = value) });
}
