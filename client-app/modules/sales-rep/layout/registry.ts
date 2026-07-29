// Which blocks exist and which region each lives in; the saved document only adds order and hidden
// flags. Registering here is all a widget needs to join drag-and-drop, hiding and persistence.
//
// Module-local rather than `useExtensionRegistry`, whose entries are `{ component, condition }` with
// no region, order or title.
import { defineAsyncComponent, markRaw } from "vue";
import type { SalesRepBlockType, SalesRepLayoutScopeType } from "../types/layout";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const SalesRepOrders = markRaw(defineAsyncComponent(() => import("../components/sales-rep-orders.vue")));
const CustomerProfileActions = markRaw(
  defineAsyncComponent(() => import("../components/customer-profile-actions.vue")),
);
const CustomerProfileInfo = markRaw(defineAsyncComponent(() => import("../components/customer-profile-info.vue")));

// Statistics-block ids are `StatWidgetCardType.key` values — the stat row renders them by key
// rather than by component, so they carry no `component` of their own.
const dashboardBlocks: SalesRepBlockType[] = [
  {
    id: "orders_on_hold",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_on_hold",
    order: 10,
  },
  {
    id: "active_projects",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.active_projects",
    order: 20,
  },
  {
    id: "orders_placed_mtd",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    order: 30,
  },
  {
    id: "my_customers",
    region: "statistics",
    titleKey: "sales_rep.hub.dashboard.widgets.my_customers",
    order: 40,
  },
  // The dashboard has no right rail yet — `mainRight` stays empty and the grid collapses to one
  // column until a widget registers into it.
  { id: "orders", region: "mainLeft", titleKey: "sales_rep.orders.title", order: 10, component: SalesRepOrders },
];

const customerProfileBlocks: SalesRepBlockType[] = [
  { id: "ytd", region: "statistics", titleKey: "sales_rep.customer_profile.widgets.ytd_purchases", order: 10 },
  {
    id: "open_balance",
    region: "statistics",
    titleKey: "sales_rep.customer_profile.widgets.open_balance",
    order: 20,
  },
  { id: "aov", region: "statistics", titleKey: "sales_rep.customer_profile.widgets.avg_order_value", order: 30 },
  { id: "orders_ytd", region: "statistics", titleKey: "sales_rep.customer_profile.widgets.orders_ytd", order: 40 },
  { id: "orders", region: "mainLeft", titleKey: "sales_rep.orders.title", order: 10, component: SalesRepOrders },
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

// eslint-disable-next-line sonarjs/function-return-type -- block definition or undefined by design
export function getBlock(scope: SalesRepLayoutScopeType, id: string): SalesRepBlockType | undefined {
  return registries[scope].find((block) => block.id === id);
}
