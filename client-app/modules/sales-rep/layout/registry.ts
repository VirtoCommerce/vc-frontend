// Which blocks exist and which region each lives in; the saved document only adds order and hidden
// flags. Registering here is all a widget needs to join drag-and-drop, hiding and persistence.
//
// Module-local rather than `useExtensionRegistry`, whose entries are `{ component, condition }` with
// no region, order or title.
import { defineAsyncComponent, markRaw } from "vue";
import type { SalesRepBlockType, SalesRepLayoutScopeType } from "../types/layout";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const SalesRepOrders = markRaw(defineAsyncComponent(() => import("../components/sales-rep-orders.vue")));
const TopSellers = markRaw(defineAsyncComponent(() => import("../components/top-sellers.vue")));
const CustomerProfileActions = markRaw(
  defineAsyncComponent(() => import("../components/customer-profile-actions.vue")),
);
const CustomerProfileInfo = markRaw(defineAsyncComponent(() => import("../components/customer-profile-info.vue")));

// Statistics-block ids are `StatWidgetCardType.key` values from useSalesRepDashboardWidgets /
// useSalesRepCustomerWidgets — the stat row renders them by key rather than by component, so they
// carry no `component` of their own. A key that drifts from those composables renders nothing.
const dashboardBlocks: SalesRepBlockType[] = [
  { id: "new_orders", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.new_orders", order: 10 },
  { id: "active_carts", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.active_carts", order: 20 },
  {
    id: "orders_placed_week",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_placed_week",
    order: 30,
  },
  {
    id: "orders_placed_mtd",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    order: 40,
  },
  {
    id: "orders_placed_ytd",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    order: 50,
  },
  { id: "my_customers", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.my_customers", order: 60 },
  // The dashboard has no right rail yet — `mainRight` stays empty and the row collapses to one
  // column until a widget registers into it.
  {
    id: "orders",
    region: "mainLeft",
    titleKey: "sales_rep.orders.title",
    order: 10,
    component: SalesRepOrders,
    props: { filterable: true },
  },
  { id: "top_sellers", region: "mainLeft", titleKey: "sales_rep.top_sellers.title", order: 20, component: TopSellers },
];

const customerProfileBlocks: SalesRepBlockType[] = [
  { id: "new_orders", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.new_orders", order: 10 },
  { id: "active_cart", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.active_cart", order: 20 },
  { id: "mtd", region: "statistics", titleKey: "sales_rep.hub.dashboard.widgets.purchased_mtd", order: 30 },
  {
    id: "orders_ytd",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_placed_ytd",
    order: 40,
  },
  { id: "aov", region: "statistics", titleKey: "sales_rep.customer_profile.widgets.avg_order_value", order: 50 },
  {
    id: "orders",
    region: "mainLeft",
    titleKey: "sales_rep.orders.title",
    order: 10,
    component: SalesRepOrders,
    props: { filterable: true },
  },
  { id: "top_sellers", region: "mainLeft", titleKey: "sales_rep.top_sellers.title", order: 20, component: TopSellers },
  {
    id: "actions",
    region: "mainRight",
    titleKey: "sales_rep.communication.quick_actions.title",
    order: 10,
    component: CustomerProfileActions,
  },
  {
    id: "info",
    region: "mainRight",
    titleKey: "sales_rep.customer_profile.info.title",
    order: 20,
    component: CustomerProfileInfo,
  },
];

const registries: Record<SalesRepLayoutScopeType, SalesRepBlockType[]> = {
  dashboard: dashboardBlocks,
  customerProfile: customerProfileBlocks,
};

/** Register a block into a surface at runtime — the seam for widgets shipped by later stories. */
export function registerBlock(scope: SalesRepLayoutScopeType, block: SalesRepBlockType): void {
  const blocks = registries[scope];
  if (blocks.some((registered) => registered.id === block.id)) {
    return;
  }
  blocks.push(block);
}

export function getBlockRegistry(scope: SalesRepLayoutScopeType): readonly SalesRepBlockType[] {
  return registries[scope];
}

export function getBlock(scope: SalesRepLayoutScopeType, id: string): SalesRepBlockType | undefined {
  return registries[scope].find((block) => block.id === id);
}
