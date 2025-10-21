import { computed } from "vue";
import { useRoute } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { BrowserTargetType } from "../enums";

export function useBrowserTarget() {
  const defaultBrowserTarget = BrowserTargetType.BLANK;
  const route = useRoute();
  const { objectType } = useSlugInfo(route.path.slice(1));
  const { themeContext } = useThemeContext();

  const browserTarget = computed((): BrowserTargetType => {
    if (route.name === "Product" || objectType.value === "CatalogProduct") {
      return themeContext.value.settings.product_page_browser_target ?? defaultBrowserTarget;
    }

    if (route.name === "Cart") {
      return themeContext.value.settings.cart_page_browser_target ?? defaultBrowserTarget;
    }

    return themeContext.value.settings.details_browser_target ?? defaultBrowserTarget;
  });

  return {
    browserTarget,
  };
}
