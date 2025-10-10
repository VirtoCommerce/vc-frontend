import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";

function _useQueuedMutations() {
  const queuedTotal = ref(0);

  function setQueuedTotal(value: number): void {
    queuedTotal.value = Math.max(0, value);
  }

  return {
    hasQueuedMutations: computed(() => queuedTotal.value > 0),
    queuedTotal,
    setQueuedTotal,
  };
}

export const useQueuedMutations = createGlobalState(_useQueuedMutations);
