import { createGlobalState, useMemoize } from "@vueuse/core";
import { useFetch } from "@/core/api/common";
import type { IPageTemplate } from "@/shared/static-content/types";

function _useTemplates() {
  const memoize = useMemoize(async (templateName: string) => {
    const { data } = await useFetch(`/content/templates/${templateName}.json`).json<IPageTemplate>();
    return data.value;
  });

  function setTemplate(templateName: string, template: IPageTemplate) {
    memoize.cache.set(memoize.generateKey(templateName), Promise.resolve(template));
  }

  return {
    getTemplate: memoize,
    setTemplate,
  };
}

export const useTemplates = createGlobalState(_useTemplates);
