import { computedAsync, createGlobalState } from "@vueuse/core";
import { useTemplates } from "@/shared/static-content/composables/useTemplates";

function _useTemplate(templateName: string) {
  const { getTemplate } = useTemplates();

  return computedAsync(() => getTemplate(templateName));
}

export const useTemplate = createGlobalState(_useTemplate);
