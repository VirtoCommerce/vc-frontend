import { useNavigations, useThemeContext } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/purchase-requests/constants";
import { menuItems } from "@/modules/purchase-requests/menu";
import { route } from "@/modules/purchase-requests/router";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const { themeContext } = useThemeContext();
const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();

const { loadModuleLocale } = useLanguages();

export function initialize(router: Router, i18n: I18n) {
  if (themeContext.value.settings.purchase_requests_enabled && isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "purchase-requests");
    // registerSidebarWidget({ id: "quotes", element: CartWidget });
  }
}
