import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

export function useBroadcastChanging(key: string) {
  const state = useLocalStorage("changing", { [key]: false }, { mergeDefaults: true });

  const changing = computed({ get: () => state.value[key], set: (value: boolean) => (state.value[key] = value) });

  return {
    changing,
  };
}
