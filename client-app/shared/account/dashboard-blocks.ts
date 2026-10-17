// The account dashboard's blocks (VCST-6078): the buyer's own order figures as stat cards, and their recent orders.
// app-runner registers them into the core layout engine before the app mounts, as a module registers its own in
// `init()`. Only these tables load with the app; the queries behind them come with the dashboard page
// (composables/useAccountDashboard.ts, components/dashboard/recent-orders-widget.vue).
import { defineAsyncComponent, markRaw } from "vue";
import { RECENT_ORDERS_DEFAULT_ROWS, RECENT_ORDERS_MAX_ROWS } from "@/core/constants";
import { LAYOUT_SCOPES, MIN_ROWS, registerBlock, statBlocks } from "@/shared/dashboard";
import type { BlockType, IStatCardDefType } from "@/shared/dashboard";

/**
 * What a card needs fetched, each token one gated slice of the `orderStatistics` query: `week` covers the week and
 * its previous-week baseline, `monthOverMonth`/`yearOverYear` only a baseline (the current side is `mtd`/`ytd`), and
 * `averageOrderValue` rides inside the `ytd` bucket.
 */
export type AccountStatNeedType = "week" | "mtd" | "monthOverMonth" | "ytd" | "yearOverYear" | "averageOrderValue";

// The keys are persisted as `block.type` in every saved document, so they are load-bearing.
export const ACCOUNT_DASHBOARD_CARDS = [
  {
    key: "orders_placed_week",
    labelKey: "shared.account.dashboard.orders_placed_week",
    icon: "cash",
    color: "info",
    needs: ["week"],
  },
  {
    key: "orders_placed_mtd",
    labelKey: "shared.account.dashboard.orders_placed_mtd",
    icon: "cash",
    color: "info",
    needs: ["mtd", "monthOverMonth"],
  },
  {
    key: "orders_placed_ytd",
    labelKey: "shared.account.dashboard.orders_placed_ytd",
    icon: "cash",
    color: "info",
    needs: ["ytd", "yearOverYear"],
  },
  {
    key: "avg_order_value",
    labelKey: "shared.account.dashboard.avg_order_value",
    icon: "presentation-chart-bar",
    color: "secondary",
    needs: ["ytd", "averageOrderValue"],
  },
] as const satisfies readonly IStatCardDefType<AccountStatNeedType>[];

// Load-bearing like the card keys.
export const RECENT_ORDERS_BLOCK_ID = "recent_orders";

// `markRaw` keeps Vue from making the component definition reactive when it lands in layout state.
const RecentOrdersWidget = markRaw(
  defineAsyncComponent(() => import("./components/dashboard/recent-orders-widget.vue")),
);

const ACCOUNT_DASHBOARD_BLOCKS: readonly BlockType[] = [
  ...statBlocks(ACCOUNT_DASHBOARD_CARDS),
  {
    id: RECENT_ORDERS_BLOCK_ID,
    region: "mainLeft",
    titleKey: "shared.account.dashboard.recent_orders.title",
    order: 10,
    component: RecentOrdersWidget,
    settings: [{ kind: "maxRows", default: RECENT_ORDERS_DEFAULT_ROWS, min: MIN_ROWS, max: RECENT_ORDERS_MAX_ROWS }],
  },
];

/** Synchronously, before the app mounts, so the dashboard's first render — its skeleton included — knows every block. */
export function registerAccountDashboardBlocks(): void {
  for (const block of ACCOUNT_DASHBOARD_BLOCKS) {
    registerBlock(LAYOUT_SCOPES.accountDashboard, block);
  }
}
