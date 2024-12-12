import { createSharedComposable } from "@vueuse/core";
import { computed, ref } from "vue";
import type { IPageTemplate } from "../types";

function _useStaticPage() {
  const staticPagePreview = ref<IPageTemplate>();

  const _staticPage = ref<IPageTemplate | undefined>();
  const staticPage = computed({
    get: () => staticPagePreview.value ?? _staticPage.value,
    set: (value) => (_staticPage.value = value),
  });

  return {
    staticPage,
    staticPagePreview,
  };
}

export const useStaticPage = createSharedComposable(_useStaticPage);
