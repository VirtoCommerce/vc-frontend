import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import type { PageTemplate } from "../types";

function _useStaticPage() {
  const staticPagePreview = ref<PageTemplate>();

  const _staticPage = ref<PageTemplate>();
  const staticPage = computed({
    get: () => staticPagePreview.value ?? _staticPage.value,
    set: (value) => (_staticPage.value = value),
  });

  return {
    staticPage,
    staticPagePreview,
  };
}

export const useStaticPage = createGlobalState(_useStaticPage);
