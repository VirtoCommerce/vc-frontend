// The blocks of the module's two layout surfaces, registered into the core layout engine by `init()`. The
// saved document only adds order and hidden flags; registering here is all a widget needs to join
// drag-and-drop, hiding and persistence.
import { defineAsyncComponent, markRaw } from "vue";
import { MIN_ROWS, registerBlock, statBlocks } from "@/shared/dashboard";
import {
  CUSTOMER_PROFILE_LAYOUT_SCOPE,
  DASHBOARD_LAYOUT_SCOPE,
  ORDERS_DEFAULT_ROWS,
  ORDERS_MAX_ROWS,
  TOP_SELLERS_DEFAULT_ROWS,
  TOP_SELLERS_MAX_ROWS,
} from "../constants";
import { CUSTOMER_PROFILE_STAT_CARDS, DASHBOARD_STAT_CARDS } from "./stat-cards";
import type { SalesRepLayoutScopeType } from "../types";
import type { BlockSettingType, BlockType } from "@/shared/dashboard";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const SalesRepOrders = markRaw(defineAsyncComponent(() => import("../components/sales-rep-orders.vue")));
const TopSellers = markRaw(defineAsyncComponent(() => import("../components/top-sellers.vue")));
const CustomerProfileActions = markRaw(
  defineAsyncComponent(() => import("../components/customer-profile-actions.vue")),
);
const CustomerProfileInfo = markRaw(defineAsyncComponent(() => import("../components/customer-profile-info.vue")));

// Both surfaces configure the same two list widgets; the row cap differs per widget, not per scope.
// Shared arrays rather than repeated literals — nothing mutates a registered block.
const ordersSettings: BlockSettingType[] = [
  { kind: "maxRows", default: ORDERS_DEFAULT_ROWS, min: MIN_ROWS, max: ORDERS_MAX_ROWS },
  { kind: "ruleTabs" },
];
const topSellersSettings: BlockSettingType[] = [
  { kind: "maxRows", default: TOP_SELLERS_DEFAULT_ROWS, min: MIN_ROWS, max: TOP_SELLERS_MAX_ROWS },
];

// The stat cards come first, from the shared card tables: the stat row renders them by key, not by
// component, so they carry none.
const DASHBOARD_BLOCKS: readonly BlockType[] = [
  ...statBlocks(DASHBOARD_STAT_CARDS),
  // The dashboard has no right rail of its own — `mainRight` stays empty and the row collapses to one
  // column until a widget registers into it (tasks, documents: see index.ts).
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

const CUSTOMER_PROFILE_BLOCKS: readonly BlockType[] = [
  ...statBlocks(CUSTOMER_PROFILE_STAT_CARDS),
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

const SALES_REP_BLOCKS: Record<SalesRepLayoutScopeType, readonly BlockType[]> = {
  [DASHBOARD_LAYOUT_SCOPE]: DASHBOARD_BLOCKS,
  [CUSTOMER_PROFILE_LAYOUT_SCOPE]: CUSTOMER_PROFILE_BLOCKS,
};

/** Every block both surfaces always have. The permission- and module-gated ones are registered by `init()`. */
export function registerSalesRepBlocks(): void {
  for (const [scope, blocks] of Object.entries(SALES_REP_BLOCKS)) {
    for (const block of blocks) {
      registerBlock(scope, block);
    }
  }
}
