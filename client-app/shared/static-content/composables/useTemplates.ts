import { createGlobalState, useMemoize } from "@vueuse/core";
import { useFetch } from "@/core/api/common";
import type { PageTemplate } from "@/shared/static-content/types";

function _useTemplates() {
  const memoize = useMemoize(async (templateName: string): Promise<PageTemplate | null> => {
    const { data } = await useFetch(`/content/templates/${templateName}.json`).json<PageTemplate>();
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
