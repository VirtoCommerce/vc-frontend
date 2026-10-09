// Which blocks exist and which region each lives in; the saved document only adds order and hidden
// flags. Registering here is all a widget needs to join drag-and-drop, hiding and persistence.
//
// Module-local rather than `useExtensionRegistry`, whose entries are `{ component, condition }` with
// no region, order or title.
import { defineAsyncComponent, markRaw } from "vue";
import {
  MIN_ROWS,
  ORDERS_DEFAULT_ROWS,
  ORDERS_MAX_ROWS,
  TOP_SELLERS_DEFAULT_ROWS,
  TOP_SELLERS_MAX_ROWS,
} from "../constants";
import { STAT_CARDS } from "./stat-cards";
import type { SalesRepBlockSettingType, SalesRepBlockType, SalesRepLayoutScopeType } from "../types/layout";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const SalesRepOrders = markRaw(defineAsyncComponent(() => import("../components/sales-rep-orders.vue")));
const TopSellers = markRaw(defineAsyncComponent(() => import("../components/top-sellers.vue")));
const CustomerProfileActions = markRaw(
  defineAsyncComponent(() => import("../components/customer-profile-actions.vue")),
);
const CustomerProfileInfo = markRaw(defineAsyncComponent(() => import("../components/customer-profile-info.vue")));

// From the shared card table: the stat row renders these by key, not by component, so they carry none.
// Order follows the table; a saved document overrides it.
const statBlocks = (scope: SalesRepLayoutScopeType): SalesRepBlockType[] =>
  STAT_CARDS[scope].map((card, index) => ({
    id: card.key,
    region: "statistics",
    titleKey: card.labelKey,
    order: (index + 1) * 10,
  }));

// Both surfaces configure the same two list widgets; the row cap differs per widget, not per scope.
// Shared arrays rather than repeated literals — nothing mutates a registered block, only the arrays
// they sit in.
const ordersSettings: SalesRepBlockSettingType[] = [
  { kind: "maxRows", default: ORDERS_DEFAULT_ROWS, min: MIN_ROWS, max: ORDERS_MAX_ROWS },
  { kind: "ruleTabs", domain: "order" },
];
const topSellersSettings: SalesRepBlockSettingType[] = [
  { kind: "maxRows", default: TOP_SELLERS_DEFAULT_ROWS, min: MIN_ROWS, max: TOP_SELLERS_MAX_ROWS },
];

const dashboardBlocks: SalesRepBlockType[] = [
  ...statBlocks("dashboard"),
  // The dashboard has no right rail yet — `mainRight` stays empty and the row collapses to one
  // column until a widget registers into it.
  {
    id: "orders",
    region: "mainLeft",
    titleKey: "sales_rep.orders.title",
    order: 10,
    component: SalesRepOrders,
    props: { filterable: true },
    settings: ordersSettings,
  },
  {
    id: "top_sellers",
    region: "mainLeft",
    titleKey: "sales_rep.top_sellers.title",
    order: 20,
    component: TopSellers,
    settings: topSellersSettings,
  },
];

const customerProfileBlocks: SalesRepBlockType[] = [
  ...statBlocks("customerProfile"),
  {
    id: "orders",
    region: "mainLeft",
    titleKey: "sales_rep.orders.title",
    order: 10,
    component: SalesRepOrders,
    props: { filterable: true },
    settings: ordersSettings,
  },
  {
    id: "top_sellers",
    region: "mainLeft",
    titleKey: "sales_rep.top_sellers.title",
    order: 20,
    component: TopSellers,
    settings: topSellersSettings,
  },
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
