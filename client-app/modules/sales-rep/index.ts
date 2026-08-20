import { computed, defineAsyncComponent } from "vue";
import { registerCacheTypePolicies } from "@/core/api/graphql/config/registerCacheTypePolicies";
import { useNavigations } from "@/core/composables/useNavigations";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import { useWishlistSharingScopes } from "@/shared/wishlists/composables/useWishlistSharingScopes";
import { loadModuleLocale } from "../utils";
import { useSharedSalesRepCustomersCount } from "./composables/useSalesRepCustomersCount";
import { isSalesRepsEnabled, isSalesRepUser } from "./composables/useSalesRepsConfig";
import {
  CUSTOMER_SHARING_SCOPE,
  DASHBOARD_NAV_LINK_ID,
  DASHBOARD_ROUTE_NAME,
  HUB_NAV_PRIORITY,
  HUB_SECTION_ID,
  MY_CUSTOMERS_NAV_LINK_ID,
  MY_CUSTOMERS_ROUTE_NAME,
  SALES_REP_ACCESS_PERMISSION,
} from "./constants";
import { layoutTypePolicies } from "./layout/cache-policies";
import { salesRepMenuSchema } from "./menu";
import { customerProfileRoute, dashboardRoute, myCustomersRoute, salesRepsRoute } from "./routes";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

export function init(router: Router, i18n: I18n) {
  if (!isSalesRepsEnabled()) {
    return;
  }

  // Relative routes -> mount under the Company parent (/company/sales-reps, /company/dashboard, /company/my-customers).
  router.addRoute(ROUTES.COMPANY.NAME, salesRepsRoute);
  router.addRoute(ROUTES.COMPANY.NAME, dashboardRoute);
  router.addRoute(ROUTES.COMPANY.NAME, myCustomersRoute);
  // Customer profile (VCST-5308) -> /company/my-customers/:organizationId.
  router.addRoute(ROUTES.COMPANY.NAME, customerProfileRoute);

  const { mergeMenuSchema, registerAccountSection } = useNavigations();
  const { checkPermissions } = useUser();

  // My customers links showing the total-customer count badge. Desktop needs its own
  // component for the sibling-route highlight; mobile only contributes the count, so the
  // host renders its own menu link with it.
  const { register } = useExtensionRegistry();
  register("accountMenu", MY_CUSTOMERS_NAV_LINK_ID, {
    component: defineAsyncComponent(() => import("./components/link-my-customers.vue")),
  });
  register("mobileMenu", MY_CUSTOMERS_NAV_LINK_ID, {
    use: useSharedSalesRepCustomersCount,
  });

  // "Sales reps" contact-info link for buyers (VCST-5409) — stays in the Corporate widget.
  mergeMenuSchema(salesRepMenuSchema);

  // Publishing a list to a customer (VCST-5332): core only learns that another sharing option exists.
  useWishlistSharingScopes().registerSharingScope({
    scope: CUSTOMER_SHARING_SCOPE,
    labelKey: "sales_rep.list_sharing.scope_label",
    statusKey: "sales_rep.list_sharing.status",
    supportsLink: true,
    shoppable: true,
    isAvailable: isSalesRepUser,
    element: defineAsyncComponent(() => import("./components/wishlist-customer-sharing.vue")),
  });

  // Gated on the scope alone: the viewer is the customer, not a rep.
  register("sharedList", EXTENSION_NAMES.sharedList.provenanceNote, {
    component: defineAsyncComponent(() => import("./components/wishlist-rep-provenance.vue")),
    // Compared as a plain string: this module owns the value, not core's generated enum.
    condition: (sharingSetting) => (sharingSetting?.scope as string | undefined) === CUSTOMER_SHARING_SCOPE,
  });

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
  registerCacheTypePolicies(layoutTypePolicies);

  void loadModuleLocale(i18n, "sales-rep");
}
