import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import type { Composer } from "vue-i18n";
import type { Router } from "vue-router";

function _useQueuedMutations() {
  const queuedTotal = ref(0);
  const text = ref("");
  const hasQueuedMutations = computed(() => queuedTotal.value > 0);

  function setQueuedTotal(value: number): void {
    queuedTotal.value = Math.max(0, value);
  }

  function initRouteGuard(router: Router, i18n: Composer): void {
    text.value = i18n.t("common.messages.pending_operations_leaving_page_confirmation");
    window.addEventListener("beforeunload", handleBeforeUnload);

    router.beforeEach((to, from, next) => {
      if (queuedTotal.value > 0) {
        if (window.confirm(text.value)) {
          next();
        }
      } else {
        next();
      }
    });
  }

  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (!queuedTotal.value) {
      return;
    }

    const confirm = window.confirm(text.value);
    if (confirm) {
      return;
    }

    e.preventDefault();
  }

  return {
    hasQueuedMutations,
    queuedTotal,
    setQueuedTotal,
    initRouteGuard,
  };
}

export const useQueuedMutations = createGlobalState(_useQueuedMutations);
