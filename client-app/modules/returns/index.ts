import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/returns/constants";
import { menuItems } from "@/modules/returns/menu";
import { route } from "@/modules/returns/router";
import { loadModuleLocale } from "@/modules/utils";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "returns");
  }
}
