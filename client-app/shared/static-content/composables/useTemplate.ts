import { Ref, ref } from "vue";
import { useFetch } from "@/core/composables";
import { PageTemplate } from "../types";

const { innerFetch } = useFetch();
const template: { [template: string]: Ref<PageTemplate | null> } = {};
const loading = ref<boolean>(false);

function useTemplate(templateName: string, pageContent: PageTemplate | null = null): Ref<PageTemplate | null> {
  if (!template[templateName]) {
    template[templateName] = ref(null);
  }
  if (pageContent) {
    template[templateName].value = pageContent;
  } else if (!template[templateName].value) {
    loading.value = true;
    innerFetch<PageTemplate>("/storefrontapi/content/templates", "POST", {
      template: templateName,
    })
      .then((x) => {
        template[templateName].value = x;
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  }
  return template[templateName];
}

export default {
  useTemplate,
  loading,
};
