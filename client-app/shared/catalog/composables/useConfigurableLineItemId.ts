import { computed } from "vue";
import { useRoute } from "vue-router";
import { LINE_ITEM_ID_URL_SEARCH_PARAM } from "@/core/constants";

export function useConfigurableLineItemId() {
  const route = useRoute();

  const configurableLineItemId = computed(() => {
    const param = route.query[LINE_ITEM_ID_URL_SEARCH_PARAM];
    return typeof param === "string" ? param : undefined;
  });

  return { configurableLineItemId };
}
