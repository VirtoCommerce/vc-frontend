import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { truncate } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import type { Product } from "@/core/api/graphql/types";

const NOTIFICATIONS_GROUP = "compare-pruducts";
const DEFAULT_MAX_PRODUCTS = 5;
const NAME_MAX_LENGTH = 60;

const productsIds = useLocalStorage<string[]>("productCompareListIds", []);

export function useCompareProducts() {
  const { themeContext } = useThemeContext();
  const notifications = useNotifications();
  const productsLimit = themeContext.value?.settings?.product_compare_limit || DEFAULT_MAX_PRODUCTS;

  function addToCompareList(product: Product) {
    if (productsIds.value.includes(product.id)) {
      return;
    }

    if (productsIds.value.length >= productsLimit) {
      notifications.warning({
        duration: 15000,
        group: NOTIFICATIONS_GROUP,
        singleInGroup: true,
        text: `Only ${productsLimit} products can be compared`,
      });

      return;
    }

    productsIds.value.push(product.id);

    notifications.success({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html:
        `Product <span class="hidden lg:inline">“<strong>${truncate(product.name, NAME_MAX_LENGTH)}</strong>”</span> ` +
        `is added to compare list ` +
        `<span class="hidden lg:inline">(${productsLimit - productsIds.value.length} items left)</span>`,
      button: {
        text: "Compare",
        to: { path: "/compare" },
        clickHandler() {
          notifications.clear(NOTIFICATIONS_GROUP);
        },
      },
    });
  }

  function removeFromCompareList(product: Product) {
    const index = productsIds.value.indexOf(product.id);

    if (index === -1) {
      return;
    }

    productsIds.value.splice(index, 1);

    notifications.warning({
      duration: 15000,
      group: NOTIFICATIONS_GROUP,
      singleInGroup: true,
      html:
        `Product <span class="hidden lg:inline">“<strong>${truncate(product.name, NAME_MAX_LENGTH)}</strong>”</span> ` +
        `was removed from the compare list`,
    });
  }

  function clearCompareList() {
    productsIds.value = [];
  }

  return {
    addToCompareList,
    removeFromCompareList,
    clearCompareList,
    productsLimit,
    productsIds: computed(() => productsIds.value.slice(0, productsLimit)),
  };
}
