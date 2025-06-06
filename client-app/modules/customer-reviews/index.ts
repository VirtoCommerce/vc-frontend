import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { loadModuleLocale } from "@/modules/utils";
import { ENABLED_KEY, MODULE_ID } from "./constants";
import type { I18n } from "@/i18n";

const { isEnabled } = useModuleSettings(MODULE_ID);

export function init(i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    void loadModuleLocale(i18n, "customer-reviews");
  }
}
