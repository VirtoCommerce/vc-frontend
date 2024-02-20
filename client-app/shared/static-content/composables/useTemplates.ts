import { createGlobalState, useMemoize } from "@vueuse/core";
import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import type { PageTemplate, PageTemplateRequest } from "@/shared/static-content/types";

function _useTemplates() {
  const payload = ref<PageTemplateRequest>();

  const { data, execute: loadTemplate } = useFetch("/storefrontapi/content/templates", { immediate: false })
    .post(payload)
    .json<PageTemplate>();

  const memoize = useMemoize(async (templateName: string) => {
    payload.value = { template: templateName };
    await loadTemplate();
    return data.value;
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
