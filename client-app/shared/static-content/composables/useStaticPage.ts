import { ref } from "vue";
import type { PageTemplate } from "../types";

const pageTemplate = ref<PageTemplate | null>(null);

export default function useStaticPage(data: PageTemplate | null = null) {
  if (data) {
    pageTemplate.value = data;
  }
  return pageTemplate;
}
