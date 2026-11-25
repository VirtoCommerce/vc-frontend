import { defineAsyncComponent } from "vue";
import { useModules } from "@/core/composables/useModules";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { MFA_PERMISSIONS, MODULE_ID, MODULE_NAME } from "./constants";
import { hasMfaSchema } from "./utils";
import type { I18n } from "@/i18n";

const MfaSettingsWidget = defineAsyncComponent(() => import("./components/mfa-settings-widget.vue"));

export function init(i18n: I18n): void {
  // A module installed without the xAPI schema would answer every query with an error, so the widgets stay off.
  // Without XAPI.Security.ReturnModuleVersion the module is not listed at all and they stay off too.
  const mfaModule = useModules().modules.value.find((module) => module.moduleId === MODULE_ID);
  if (!mfaModule?.version || !hasMfaSchema(mfaModule.version)) {
    return;
  }

  void loadModuleLocale(i18n, MODULE_NAME);

  const { register } = useExtensionRegistry();
  const { checkPermissions } = useUser();

  register("accountSecurity", "mfa-settings", {
    component: MfaSettingsWidget,
    props: { scope: "user" },
  });

  register("companyInfo", "mfa-settings", {
    component: MfaSettingsWidget,
    props: { scope: "organization" },
    condition: () => checkPermissions(MFA_PERMISSIONS.manageOrganizationMfa),
  });
}
