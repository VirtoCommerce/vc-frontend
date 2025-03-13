import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";

function _usePageBuilderSchema() {
  const pageBuilderSchema = ref<PageBuilderSchemaType>({ sections: {} });
  return { pageBuilderSchema };
}

export const usePageBuilderSchema = createGlobalState(_usePageBuilderSchema);
