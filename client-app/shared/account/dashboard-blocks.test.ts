import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { Logger } from "@/core/utilities";
import { getBlock, getBlockRegistry, LAYOUT_SCOPES, reconcileLayout } from "@/shared/dashboard";
import SalesReportSkeleton from "./components/dashboard/sales-report-skeleton.vue";
import {
  ACCOUNT_DASHBOARD_CARDS,
  RECENT_ORDERS_BLOCK_ID,
  registerAccountDashboardBlocks,
  SALES_REPORT_BLOCK_ID,
} from "./dashboard-blocks";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
// The report itself never resolves here: what matters is what holds its place meanwhile.
vi.mock("./components/dashboard/sales-report-widget.vue", () => new Promise(() => undefined));

// As app-runner does, once: the registry is app state, and a second registration would only warn.
registerAccountDashboardBlocks();

const SCOPE = LAYOUT_SCOPES.accountDashboard;

describe("account dashboard blocks", () => {
  // Persisted as `block.type` in every saved document: a renamed id strands the user's arrangement of that block.
  it("pins the block ids", () => {
    expect(getBlockRegistry(SCOPE).map((block) => block.id)).toEqual([
      "orders_placed_week",
      "orders_placed_mtd",
      "orders_placed_ytd",
      "avg_order_value",
      "sales_report",
      "recent_orders",
    ]);
  });

  it("registers every block without an id clash", () => {
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it("makes a stat block of every card, captioned like the card", () => {
    const statBlocks = getBlockRegistry(SCOPE).filter((block) => block.region === "statistics");

    expect(statBlocks.map((block) => [block.id, block.titleKey])).toEqual(
      ACCOUNT_DASHBOARD_CARDS.map((card) => [card.key, card.labelKey]),
    );
  });

  // What each card's figures come from, so the query asks for exactly the visible cards' slices.
  it("declares what each card renders", () => {
    expect(Object.fromEntries(ACCOUNT_DASHBOARD_CARDS.map((card) => [card.key, card.needs]))).toEqual({
      orders_placed_week: ["week"],
      orders_placed_mtd: ["mtd", "monthOverMonth"],
      orders_placed_ytd: ["ytd", "yearOverYear"],
      avg_order_value: ["ytd", "averageOrderValue"],
    });
  });

  it("puts the recent orders in the wide column, with a row cap of 5 between 1 and 20 and status tabs", () => {
    const recentOrders = getBlock(SCOPE, RECENT_ORDERS_BLOCK_ID);

    expect(recentOrders?.region).toBe("mainLeft");
    expect(recentOrders && "component" in recentOrders && Boolean(recentOrders.component)).toBe(true);
    expect(recentOrders && "settings" in recentOrders && recentOrders.settings).toEqual([
      { kind: "maxRows", default: 5, min: 1, max: 20 },
      { kind: "ruleTabs" },
    ]);
  });

  // Right after the stat row, across the page: a year of months does not fit half of it.
  it("puts the sales report in the full-width region, with no settings", () => {
    const salesReport = getBlock(SCOPE, SALES_REPORT_BLOCK_ID);

    expect(salesReport?.region).toBe("fullWidth");
    expect(salesReport && "component" in salesReport && Boolean(salesReport.component)).toBe(true);
    expect(salesReport && "settings" in salesReport ? salesReport.settings : undefined).toBeUndefined();
  });

  // The same placeholder from the layout's skeleton until the report's chunk has loaded, so the block never collapses.
  it("holds the sales report's place with its own placeholder, while the layout and the report load", () => {
    const salesReport = getBlock(SCOPE, SALES_REPORT_BLOCK_ID);
    if (!salesReport || !("component" in salesReport)) {
      throw new Error("the sales report is not registered as a widget");
    }

    expect(salesReport.skeleton).toBe(SalesReportSkeleton);

    const wrapper = mount(salesReport.component, {
      props: { title: "Sales Statistics" },
      global: {
        stubs: { VcWidget: defineComponent({ props: ["title"], setup: (props) => () => h("div", props.title) }) },
      },
    });

    expect(wrapper.findComponent(SalesReportSkeleton).props("title")).toBe("Sales Statistics");
  });

  // What a user who never saved this dashboard sees.
  it("shows every card, the sales report and the recent orders by default, with the rail empty", () => {
    const state = reconcileLayout(null, getBlockRegistry(SCOPE));

    expect(state.regions.statistics).toEqual({ visible: ACCOUNT_DASHBOARD_CARDS.map((card) => card.key), hidden: [] });
    expect(state.regions.fullWidth).toEqual({ visible: [SALES_REPORT_BLOCK_ID], hidden: [] });
    expect(state.regions.mainLeft).toEqual({ visible: [RECENT_ORDERS_BLOCK_ID], hidden: [] });
    expect(state.regions.mainRight).toEqual({ visible: [], hidden: [] });
    expect(state.settings[RECENT_ORDERS_BLOCK_ID]).toEqual({ maxRows: 5, hiddenTabs: [] });
  });
});
