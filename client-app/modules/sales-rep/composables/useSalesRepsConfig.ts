// MOCK gate — kept deliberately: the backend module (vc-module-sales-rep) exposes NO
// storefront setting yet — its module.manifest has no <settings> section, so there is no
// role-name value for useModuleSettings() to read (and isEnabled() is strict `value === true`,
// which would DISABLE the module). The DATA path is real (customerSalesReps via useSalesReps);
// only this gate stays mocked until the backend ships the setting.
//
// SWAP POINT (when the backend adds the manifest setting): derive enabled from the
// role-name string —
//   import { useModuleSettings } from "@/core/composables/useModuleSettings";
//   import { MODULE_ID, ROLE_NAME_KEY } from "../constants";
//   const roleName = useModuleSettings(MODULE_ID).getSettingValue(ROLE_NAME_KEY);
//   return typeof roleName === "string" && roleName.trim().length > 0;
export function isSalesRepsEnabled(): boolean {
  return true;
}
