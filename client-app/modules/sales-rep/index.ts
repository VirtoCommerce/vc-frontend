import { useNavigations } from "@/core/composables/useNavigations";
import { loadModuleLocale } from "../utils";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import { salesRepMenuSchema } from "./menu";
import { salesRepsRoute } from "./routes";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

export function init(router: Router, i18n: I18n) {
  if (!isSalesRepsEnabled()) {
    return;
  }

  // Relative route -> mounts under the "Company" parent (/company/sales-reps).
  router.addRoute("Company", salesRepsRoute);
  // In-repo equivalent of the plugin's extendMenuSchema — injects the Corporate nav link.
  useNavigations().mergeMenuSchema(salesRepMenuSchema);
  void loadModuleLocale(i18n, "sales-rep");
}
