import { computed, toValue, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/core/composables/useAnalytics";
import type { Product, SavedForLaterListFragment } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

type SavedForLaterItemType = SavedForLaterListFragment["items"][number];

/**
 * The cart's Saved for later impression and clicks. Used by the page, not the widget: the cart renders the widget in
 * two branches, and a flip between an empty and a non-empty cart remounts it.
 */
export function useSavedForLaterAnalytics(
  availableItems: MaybeRefOrGetter<SavedForLaterItemType[]>,
  isHidden: MaybeRefOrGetter<boolean>,
) {
  const { t } = useI18n();
  const { analytics } = useAnalytics();

  const listProperties = computed(() => ({
    item_list_id: "saved_for_later",
    item_list_name: t("pages.cart.saved_for_later"),
  }));

  let reportedSignature: string | undefined;

  watch(
    () => toValue(availableItems),
    (items) => {
      const signature = items.map((item) => item.id).join(",");

      if (toValue(isHidden) || !items.length || signature === reportedSignature) {
        return;
      }
      reportedSignature = signature;

      analytics(
        "viewItemList",
        items.map((item) => item.product as Product),
        listProperties.value,
      );
    },
    { immediate: true },
  );

  function selectItem(product: SavedForLaterItemType["product"], index: number): void {
    if (!product) {
      return;
    }

    analytics("selectItem", product as Product, { ...listProperties.value, index });
  }

  return { selectItem };
}
