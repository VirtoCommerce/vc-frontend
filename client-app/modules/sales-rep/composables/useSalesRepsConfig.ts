import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { ENABLED_KEY, MODULE_ID } from "../constants";

// The Sales reps feature is gated by the backend module's storefront setting
// `SalesRep.Enabled` (VirtoCommerce.SalesRep, Boolean, default false). When the module
// isn't installed the storefront receives no settings for it, so isEnabled() returns
// false and the page/menu link stay hidden — same result as an explicit opt-out.
export function isSalesRepsEnabled(): boolean {
  return useModuleSettings(MODULE_ID).isEnabled(ENABLED_KEY);
}
