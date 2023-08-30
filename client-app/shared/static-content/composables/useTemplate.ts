import { ref } from "vue";
import { useFetch } from "@/core/composables";
import type { PageTemplate } from "../types";
import type { Ref } from "vue";

const { innerFetch } = useFetch();
const template: { [template: string]: Ref<PageTemplate | null> } = {};

export function useTemplate(templateName: string, pageContent: PageTemplate | null = null): Ref<PageTemplate | null> {
  if (!template[templateName]) {
    template[templateName] = ref(null);
  }
  if (pageContent) {
    template[templateName].value = pageContent;
  } else if (!template[templateName].value) {
    innerFetch<PageTemplate>("/storefrontapi/content/templates", "POST", {
      template: templateName,
    }).then((x) => {
      template[templateName].value = x;
    });
  }
  return template[templateName];
}
