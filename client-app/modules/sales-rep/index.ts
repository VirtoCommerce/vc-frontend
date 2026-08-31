import { computed, defineAsyncComponent } from "vue";
import { cache } from "@/core/api/graphql/config";
import { useNavigations } from "@/core/composables/useNavigations";
import { useUser } from "@/shared/account/composables/useUser";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import { useWishlistSharingScopes } from "@/shared/wishlists/composables/useWishlistSharingScopes";
import { loadModuleLocale } from "../utils";
import { isSalesRepsEnabled, isSalesRepUser } from "./composables/useSalesRepsConfig";
import {
  ACTIVITIES_NAV_LINK_ID,
  ACTIVITIES_ROUTE_NAME,
  CUSTOMER_SHARING_SCOPE,
  DASHBOARD_LAYOUT_SCOPE,
  DASHBOARD_NAV_LINK_ID,
  DASHBOARD_ROUTE_NAME,
  DOCUMENTS_NAV_LINK_ID,
  DOCUMENTS_ROUTE_NAME,
  HUB_NAV_PRIORITY,
  HUB_SECTION_ID,
  MY_CUSTOMERS_NAV_LINK_ID,
  MY_CUSTOMERS_ROUTE_NAME,
  SALES_REP_ACCESS_PERMISSION,
  SALES_REP_DOCUMENTS_READ_PERMISSION,
} from "./constants";
import { registerLayoutTypePolicies } from "./layout/cache-policies";
import { documentsBlock } from "./layout/documents-block";
import { registerBlock } from "./layout/registry";
import { salesRepMenuSchema } from "./menu";
import {
  activitiesRoute,
  customerProfileRoute,
  dashboardRoute,
  documentsRoute,
  isMyActivity,
  isMyCustomersArea,
  myCustomersRoute,
  salesRepsRoute,
} from "./routes";
import type { ExtendedMenuLinkType } from "@/core/types";
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
  // Document library (VCST-5730) -> /company/documents (its own beforeEnter checks documents:read).
  router.addRoute("Company", documentsRoute);
  // All-activity feed (VCST-5337) -> /company/activities.
  router.addRoute("Company", activitiesRoute);

  const { mergeMenuSchema, registerAccountSection } = useNavigations();
  const { checkPermissions } = useUser();

  // The user is resolved before module init (app-runner sets it first) and permissions only change
  // with a re-login, so a one-shot check here is the module's registration seam for permission-gated
  // surfaces (VCST-5730): without documents:read the widget, the page route guard and the nav link
  // all stay invisible.
  const canReadDocuments = checkPermissions(SALES_REP_ACCESS_PERMISSION, SALES_REP_DOCUMENTS_READ_PERMISSION);

  if (canReadDocuments) {
    // Caveat: while the permission is absent the block is unknown to the layout registry, so a layout
    // SAVED in that state drops the block's persisted position/settings (reconcileLayout discards
    // unregistered types); when the permission returns, the widget comes back at its defaults.
    registerBlock(DASHBOARD_LAYOUT_SCOPE, documentsBlock);
  }

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

  // The Documents link exists only for reps who may read the library — dropped from the section
  // outright (both menus render section children), the same one-shot gate as the widget above.
  const documentsNavLink: ExtendedMenuLinkType[] = canReadDocuments
    ? [
        {
          id: DOCUMENTS_NAV_LINK_ID,
          // The one "Document library" label — shared by this nav link, the page H1 and the widget.
          title: "sales_rep.documents.title",
          icon: "document-text",
          route: { name: DOCUMENTS_ROUTE_NAME },
        },
      ]
    : [];

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
        // A customer's profile and their activity are pages about a customer, so the rail keeps this
        // item lit there — vue-router cannot tell, they are sibling route records.
        activeWhen: isMyCustomersArea,
      },
      ...documentsNavLink,
      {
        id: ACTIVITIES_NAV_LINK_ID,
        title: "sales_rep.activity.navigation.link",
        icon: "activity",
        route: { name: ACTIVITIES_ROUTE_NAME },
        // The same route scoped to one customer is that customer's page, not the rep's own feed.
        activeWhen: isMyActivity,
      },
    ],
    isVisible: computed(() => isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION)),
  });

  // Layout regions and blocks carry ids that repeat across surfaces, so Apollo would normalize them
  // into entities shared by every scope. See layout/cache-policies.ts.
  registerLayoutTypePolicies(cache);

  void loadModuleLocale(i18n, "sales-rep");
}
