import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import { getEmptySchema } from "./models/PageBuilderSchemaType";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";

function _usePageBuilderSchema() {
  const pageBuilderSchema = ref<PageBuilderSchemaType>(getEmptySchema());
  return { pageBuilderSchema };
}

export const usePageBuilderSchema = createGlobalState(_usePageBuilderSchema);
