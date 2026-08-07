import { computed, defineAsyncComponent } from "vue";
import { cache } from "@/core/api/graphql/config";
import { useNavigations } from "@/core/composables/useNavigations";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import {
  DASHBOARD_NAV_LINK_ID,
  DASHBOARD_ROUTE_NAME,
  HUB_NAV_PRIORITY,
  HUB_SECTION_ID,
  MY_CUSTOMERS_NAV_LINK_ID,
  MY_CUSTOMERS_ROUTE_NAME,
  SALES_REP_ACCESS_PERMISSION,
} from "./constants";
import { registerLayoutTypePolicies } from "./layout/cache-policies";
import { salesRepMenuSchema } from "./menu";
import { customerProfileRoute, dashboardRoute, myCustomersRoute, salesRepsRoute } from "./routes";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

export function init(router: Router, i18n: I18n) {
  if (!isSalesRepsEnabled()) {
    return;
  }

  // Relative routes -> mount under the "Company" parent (/company/sales-reps, /company/dashboard, /company/my-customers).
  router.addRoute("Company", salesRepsRoute);
  router.addRoute("Company", dashboardRoute);
  router.addRoute("Company", myCustomersRoute);
  // Customer profile (VCST-5308) -> /company/my-customers/:organizationId.
  router.addRoute("Company", customerProfileRoute);

  const { mergeMenuSchema, registerAccountSection } = useNavigations();
  const { checkPermissions } = useUser();

  // Custom My customers links that show the total-customer count badge (desktop + mobile).
  const { register } = useExtensionRegistry();
  register("accountMenu", MY_CUSTOMERS_NAV_LINK_ID, {
    component: defineAsyncComponent(() => import("./components/link-my-customers.vue")),
  });
  register("mobileMenu", MY_CUSTOMERS_NAV_LINK_ID, {
    component: defineAsyncComponent(() => import("./components/link-my-customers-mobile.vue")),
  });

  // "Sales reps" contact-info link for buyers (VCST-5409) — stays in the Corporate widget.
  mergeMenuSchema(salesRepMenuSchema);

  // "Sales Rep hub" left-rail widget — visible only when the user is a Sales Rep (VCST-5469).
  registerAccountSection({
    id: HUB_SECTION_ID,
    title: "sales_rep.hub.title",
    icon: "users",
    priority: HUB_NAV_PRIORITY,
    children: [
      {
        id: DASHBOARD_NAV_LINK_ID,
        title: "sales_rep.hub.dashboard.navigation.link",
        icon: "view-grid",
        route: { name: DASHBOARD_ROUTE_NAME },
      },
      {
        id: MY_CUSTOMERS_NAV_LINK_ID,
        title: "sales_rep.my_customers.navigation.link",
        icon: "users",
        route: { name: MY_CUSTOMERS_ROUTE_NAME },
      },
    ],
    isVisible: computed(() => isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION)),
  });

  // Layout regions and blocks carry ids that repeat across surfaces, so Apollo would normalize them
  // into entities shared by every scope. See layout/cache-policies.ts.
  registerLayoutTypePolicies(cache);

  void loadModuleLocale(i18n, "sales-rep");
}
