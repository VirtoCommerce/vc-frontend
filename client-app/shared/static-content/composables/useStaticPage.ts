import { ref } from "vue";
import type { PageTemplate } from "../types";

const pageTemplate = ref<PageTemplate | null>(null);
let isExclusive = false;

export function useStaticPage(data: PageTemplate | null = null, exclusive: boolean = false) {
  if (data && ((isExclusive && exclusive) || !isExclusive)) {
    pageTemplate.value = data;
  }
  if (exclusive) {
    isExclusive = exclusive;
  }
  return pageTemplate;
}
