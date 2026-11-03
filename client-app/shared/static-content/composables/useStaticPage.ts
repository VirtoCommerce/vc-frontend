import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import type { IPageTemplate } from "../types";

function _useStaticPage() {
  const staticPagePreview = ref<IPageTemplate>();
  /** What the previewed page's template rules see, when the designer previews it away from its own address. */
  const staticPagePreviewSubject = ref<{ permalink?: string; objectType?: string }>();

  const _staticPage = ref<IPageTemplate | undefined>();
  const staticPage = computed({
    get: () => staticPagePreview.value ?? _staticPage.value,
    set: (value) => (_staticPage.value = value),
  });

  return {
    staticPage,
    staticPagePreview,
    staticPagePreviewSubject,
  };
}

export const useStaticPage = createGlobalState(_useStaticPage);
