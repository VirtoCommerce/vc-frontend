import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities";
import { getBlock, getBlockRegistry, LAYOUT_SCOPES, reconcileLayout } from "@/shared/dashboard";
import { ACCOUNT_DASHBOARD_CARDS, RECENT_ORDERS_BLOCK_ID, registerAccountDashboardBlocks } from "./dashboard-blocks";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

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

  it("puts the recent orders in the wide column, with a row cap of 5 between 1 and 20", () => {
    const recentOrders = getBlock(SCOPE, RECENT_ORDERS_BLOCK_ID);

    expect(recentOrders?.region).toBe("mainLeft");
    expect(recentOrders && "component" in recentOrders && Boolean(recentOrders.component)).toBe(true);
    expect(recentOrders && "settings" in recentOrders && recentOrders.settings).toEqual([
      { kind: "maxRows", default: 5, min: 1, max: 20 },
    ]);
  });

  // What a user who never saved this dashboard sees.
  it("shows every card and the recent orders by default, with the rail empty", () => {
    const state = reconcileLayout(null, getBlockRegistry(SCOPE));

    expect(state.regions.statistics).toEqual({ visible: ACCOUNT_DASHBOARD_CARDS.map((card) => card.key), hidden: [] });
    expect(state.regions.mainLeft).toEqual({ visible: [RECENT_ORDERS_BLOCK_ID], hidden: [] });
    expect(state.regions.mainRight).toEqual({ visible: [], hidden: [] });
    expect(state.settings[RECENT_ORDERS_BLOCK_ID]).toEqual({ maxRows: 5, hiddenTabs: [] });
  });
});
