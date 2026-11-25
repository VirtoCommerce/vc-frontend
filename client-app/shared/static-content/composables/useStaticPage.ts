import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { resolveTranslatableValues } from "@/core/theme-snapshot";
import type { IPageTemplate } from "../types";

function _useStaticPage() {
  const { currentLanguage, defaultStoreCulture } = useLanguages();

  const staticPagePreview = ref<IPageTemplate>();
  const staticPagePreviewSubject = ref<{ permalink?: string; objectType?: string }>();

  const _staticPage = ref<IPageTemplate | undefined>();
  const staticPage = computed({
    get: () => {
      const page = staticPagePreview.value ?? _staticPage.value;

      // A page has one language, but a section copied from a template may still hold a text per language.
      return (
        page && resolveTranslatableValues(page, currentLanguage.value?.cultureName ?? "", defaultStoreCulture.value)
      );
    },
    set: (value) => (_staticPage.value = value),
  });

  return {
    staticPage,
    staticPagePreview,
    staticPagePreviewSubject,
  };
}

export const useStaticPage = createGlobalState(_useStaticPage);
