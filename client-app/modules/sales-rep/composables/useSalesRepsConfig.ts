import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables/useUser";
import { ENABLED_KEY, MODULE_ID, SALES_REP_ACCESS_PERMISSION } from "../constants";

// The Sales reps feature is gated by the backend module's storefront setting
// `SalesRep.Enabled` (VirtoCommerce.SalesRep, Boolean, default false). When the module
// isn't installed the storefront receives no settings for it, so isEnabled() returns
// false and the page/menu link stay hidden — same result as an explicit opt-out.
export function isSalesRepsEnabled(): boolean {
  return useModuleSettings(MODULE_ID).isEnabled(ENABLED_KEY);
}

// Single source of truth for "the caller may act as a Sales Rep", so rep-only surfaces cannot drift apart.
export function isSalesRepUser(): boolean {
  return isSalesRepsEnabled() && useUser().checkPermissions(SALES_REP_ACCESS_PERMISSION);
}
