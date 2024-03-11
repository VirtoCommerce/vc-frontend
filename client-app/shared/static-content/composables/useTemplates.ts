import { createGlobalState, useMemoize } from "@vueuse/core";
import { useFetch } from "@/core/api/common";
import type { PageTemplate } from "@/shared/static-content/types";

//list of files names in client-app/public/content/templates
const TEMPLATES = ["product"];

function _useTemplates() {
  const memoize = useMemoize(async (templateName: string) => {
    if (!TEMPLATES.includes(templateName as string)) {
      throw new Error(`Template with name ${templateName}.json not found!`);
    }

    const { data } = await useFetch(`/content/templates/${templateName}.json`).get().json();
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
