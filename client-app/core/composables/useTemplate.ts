import { Ref, ref } from "vue";
import { useFetch } from "@/core/composables";
import { PageTemplate } from "@/core/types";

const { innerFetch } = useFetch();
const template: { [template: string]: Ref<PageTemplate> } = {};

export default async function useTemplate(
  templateName: string,
  pageContent: PageTemplate | null = null
): Promise<Ref<PageTemplate>> {
  if (!pageContent) {
    if (!template[templateName]) {
      const result = await innerFetch<PageTemplate>("/storefrontapi/content/templates", "POST", {
        template: templateName,
      });
      template[templateName] = ref(result);
    }
  } else {
    if (!template[templateName]) {
      template[templateName] = ref(pageContent);
    } else {
      template[templateName].value = pageContent;
    }
  }
  return template[templateName];
}
