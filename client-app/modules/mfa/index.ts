import { loadModuleLocale } from "../utils";
import { MODULE_NAME } from "./constants";
import type { I18n } from "@/i18n";

export { default as MfaSettingsWidget } from "./components/mfa-settings-widget.vue";
export { MFA_PERMISSIONS } from "./constants";

export function init(i18n: I18n): void {
  void loadModuleLocale(i18n, MODULE_NAME);
}
