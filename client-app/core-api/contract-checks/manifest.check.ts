/**
 * Compiled by build-types.mjs against the freshly generated contract, exactly as a plugin's
 * `plugin.config.ts` sees the facade. Every `@ts-expect-error` must still fire: an unused one fails
 * the build, so a guarantee that silently stops holding is caught here, not in a plugin.
 */
import {
  and,
  authenticated,
  definePluginManifest,
  not,
  settingEnabled,
  settingValue,
  themeSetting,
  userCan,
} from "@vc-frontend/core/manifest";
import type { ConditionType, IPluginContributionsType, SlotContextMapType, SlotIdType } from "@vc-frontend/core";

// ── The reference case: every contribution the sales-rep module makes that is visible before it runs ──

const ACCESS = "sales-rep:access";
const DOCUMENTS_READ = "sales-rep-documents:read";

export const salesRep: IPluginContributionsType = definePluginManifest({
  when: settingEnabled("SalesRep.Enabled"),
  routes: [
    { path: "sales-reps", parent: "Company", name: "SalesReps" },
    { path: "dashboard", parent: "Company", name: "SalesRepDashboard", when: userCan(ACCESS) },
    { path: "my-customers", parent: "Company", name: "SalesRepMyCustomers", when: userCan(ACCESS) },
    { path: "my-customers/:organizationId", parent: "Company", name: "SalesRepCustomerProfile", when: userCan(ACCESS) },
    {
      path: "my-customers/:organizationId/orders",
      parent: "Company",
      name: "SalesRepCustomerOrders",
      when: userCan(ACCESS),
    },
    {
      path: "my-customers/:organizationId/orders/:orderId",
      parent: "Company",
      name: "SalesRepCustomerOrder",
      when: userCan(ACCESS),
    },
    { path: "customer-orders", parent: "Company", name: "SalesRepAllCustomerOrders", when: userCan(ACCESS) },
    { path: "documents", parent: "Company", name: "SalesRepDocuments", when: userCan(ACCESS, DOCUMENTS_READ) },
  ],
  menu: [
    {
      surface: "header",
      group: "corporate",
      id: "sales-reps",
      title: "sales_rep.navigation.link",
      icon: "user-group",
      routeName: "SalesReps",
      priority: 40,
    },
    {
      surface: "account",
      id: "sales-rep-hub",
      title: "sales_rep.hub.title",
      icon: "users",
      priority: 5,
      when: userCan(ACCESS),
      children: [
        {
          id: "sales-rep-dashboard",
          title: "sales_rep.hub.dashboard.navigation.link",
          icon: "view-grid",
          routeName: "SalesRepDashboard",
        },
        {
          id: "sales-rep-my-customers",
          title: "sales_rep.my_customers.navigation.link",
          icon: "users",
          routeName: "SalesRepMyCustomers",
        },
        {
          id: "sales-rep-documents",
          title: "sales_rep.documents.title",
          icon: "document-text",
          routeName: "SalesRepDocuments",
          when: userCan(ACCESS, DOCUMENTS_READ),
        },
      ],
    },
  ],
  slots: [
    { at: "accountMenu/sales-rep-my-customers", policy: "reserve" },
    { at: "mobileMenu/sales-rep-my-customers", policy: "none" },
    { at: "sharedList/provenance-note", policy: "reserve", when: (field) => field("scope").eq("Customer") },
  ],
});

// ── Every other kind of condition and slot context ──────────────────────────────────────────────

definePluginManifest({
  when: and(themeSetting("push_messages_enabled"), authenticated(), settingValue("Some.Mode").eq("on")),
  routes: [
    { path: "push-messages", parent: "Account", name: "PushMessages", when: themeSetting("push_messages_enabled") },
    {
      path: "push-messages",
      parent: "Account",
      name: "PushMessagesSignIn",
      redirect: "SignIn",
      when: not(authenticated()),
    },
  ],
  slots: [
    {
      at: "productCard/card-button",
      policy: "reserve",
      when: (field) => and(not(field("availabilityData.isInStock")), not(field("hasVariations"))),
    },
    { at: "paymentPage/payment-methods", policy: "block", when: (field) => field("paymentTypeName").eq("Skyflow") },
    { at: "cartPayment/skyflow", policy: "block", when: (field) => field("paymentTypeName").eq("Skyflow") },
  ],
});

// ── What must NOT compile ─────────────────────────────────────────────────────────────────────

// @ts-expect-error a name the category does not list
export const unknownName: keyof SlotContextMapType = "productCard/nope";
// @ts-expect-error a category the registry does not have
export const unknownCategory: SlotIdType = "nope/x";

declare const fieldTerm: ConditionType<"slot">;

definePluginManifest({
  // @ts-expect-error a field term at plugin level: nothing is rendered when the fetch is decided
  when: fieldTerm,
});
definePluginManifest({
  // @ts-expect-error a field term in a route, even mixed with a global one
  routes: [{ path: "p", name: "P", when: and(fieldTerm, authenticated()) }],
});
definePluginManifest({
  // @ts-expect-error a host route that does not exist
  routes: [{ path: "p", parent: "Compny", name: "P" }],
});
definePluginManifest({
  // @ts-expect-error a menu group the header schema does not have
  menu: [{ surface: "header", group: "company", id: "a", title: "t", routeName: "A" }],
});
definePluginManifest({
  slots: [
    // @ts-expect-error a path absent from this slot's context
    { at: "sharedList/provenance-note", policy: "reserve", when: (field) => field("nope") },
    // @ts-expect-error a comparison of the wrong type
    { at: "productCard/card-button", policy: "reserve", when: (field) => field("hasVariations").eq("yes") },
    // @ts-expect-error a menu slot has no context to read
    { at: "accountMenu/x", policy: "reserve", when: (field) => field("id") },
    // @ts-expect-error an unknown policy
    { at: "accountMenu/x", policy: "hold" },
  ],
});
// @ts-expect-error userCan needs at least one permission
userCan();
