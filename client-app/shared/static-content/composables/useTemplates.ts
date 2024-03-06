import { createGlobalState, useMemoize } from "@vueuse/core";
import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import type { PageTemplate, PageTemplateRequest } from "@/shared/static-content/types";

function _useTemplates() {
  const payload = ref<PageTemplateRequest>();

  const memoize = useMemoize(async (templateName: string) => {
    payload.value = { template: templateName };
    const { data } = await useFetch(`/content/templates/${payload.value?.template}.json`).get().json();
    return data.value as PageTemplate;
  });

  function setTemplate(templateName: string, template: PageTemplate) {
    memoize.cache.set(memoize.generateKey(templateName), Promise.resolve(template));
  }

  return {
    getTemplate: memoize,
    setTemplate,
  };
}

export const useTemplates = createGlobalState(_useTemplates);
