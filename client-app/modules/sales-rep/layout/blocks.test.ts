import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities";
import {
  getBlock,
  getBlockRegistry,
  LAYOUT_SCOPES,
  reconcileLayout,
  registerBlock,
  serializeLayout,
} from "@/shared/dashboard";
import { DOCUMENTS_BLOCK_ID, DOCUMENTS_DEFAULT_ROWS, DOCUMENTS_MAX_ROWS } from "../constants";
import { registerSalesRepBlocks } from "./blocks";
import { documentsBlock } from "./documents-block";
import { CUSTOMER_PROFILE_STAT_CARDS, DASHBOARD_STAT_CARDS } from "./stat-cards";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

// As init() does. Once per file: the registry is module state, and a second registration would only warn.
registerSalesRepBlocks();

// The module's two dashboards. Their scope literals are pinned with the engine's (shared/dashboard/registry.test.ts).
const DASHBOARD = LAYOUT_SCOPES.salesRepDashboard;
const CUSTOMER_PROFILE = LAYOUT_SCOPES.salesRepCustomerProfile;
const SCOPES = [DASHBOARD, CUSTOMER_PROFILE];

describe("sales-rep blocks", () => {
  // Ids are persisted as `block.type`; the engine keeps the first of two and warns about the second.
  it("registers both surfaces without a single id clash", () => {
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it.each(SCOPES)("gives every content widget in %s a component to render", (scope) => {
    const widgets = getBlockRegistry(scope).filter((block) => block.region !== "statistics");

    expect(widgets.length).toBeGreaterThan(0);
    expect(widgets.every((block) => "component" in block && Boolean(block.component))).toBe(true);
  });

  it.each([
    [DASHBOARD, DASHBOARD_STAT_CARDS],
    [CUSTOMER_PROFILE, CUSTOMER_PROFILE_STAT_CARDS],
  ] as const)("makes a %s stat block of every card, captioned like the card", (scope, cards) => {
    const statBlocks = getBlockRegistry(scope).filter((block) => block.region === "statistics");

    expect(statBlocks.map((block) => [block.id, block.titleKey])).toEqual(
      cards.map((card) => [card.key, card.labelKey]),
    );
  });

  it("puts the profile's quick actions and info in the rail", () => {
    expect(getBlock(CUSTOMER_PROFILE, "actions")?.region).toBe("mainRight");
    expect(getBlock(CUSTOMER_PROFILE, "info")?.region).toBe("mainRight");
  });

  // The orders widget's filter chips depend on it; nothing else would notice it going missing.
  it.each(SCOPES)("lets the %s orders widget filter, and configure rows and tabs", (scope) => {
    const orders = getBlock(scope, "orders");

    expect(orders && "props" in orders && orders.props).toEqual({ filterable: true });
    expect(orders && "settings" in orders && orders.settings?.map((setting) => setting.kind)).toEqual([
      "maxRows",
      "ruleTabs",
    ]);
  });
});

// Not in the defaults: init registers it only for reps carrying documents:read (VCST-5730), so the shape is
// pinned on the exported definition and the registration exercised here.
describe("documents block", () => {
  it("targets the dashboard right rail with a component and the 5/10 row cap", () => {
    expect(documentsBlock.id).toBe(DOCUMENTS_BLOCK_ID);
    expect(documentsBlock.region).toBe("mainRight");
    expect("component" in documentsBlock && Boolean(documentsBlock.component)).toBe(true);
    expect("settings" in documentsBlock && documentsBlock.settings).toEqual([
      { kind: "maxRows", default: DOCUMENTS_DEFAULT_ROWS, min: 1, max: DOCUMENTS_MAX_ROWS },
    ]);
  });
});

// Against the REAL dashboard registry with the documents widget registered the way init() registers it
// (VCST-5730) — a synthetic registry cannot catch the runtime-registered block drifting out of the
// persistence contract (id/type, region membership, settings vocabulary).
describe("documents block persistence", () => {
  registerBlock(DASHBOARD, documentsBlock);
  const dashboardRegistry = getBlockRegistry(DASHBOARD);

  it("reconciles into the visible half of mainRight by default", () => {
    const state = reconcileLayout(null, dashboardRegistry);

    expect(state.regions.mainRight.visible).toContain(DOCUMENTS_BLOCK_ID);
    expect(state.regions.mainRight.hidden).not.toContain(DOCUMENTS_BLOCK_ID);
  });

  it("serializes a hidden documents block into the save payload, row cap included", () => {
    const state = reconcileLayout(null, dashboardRegistry);
    // What setHidden does when the rep clicks the widget's ✕.
    state.regions.mainRight.visible = state.regions.mainRight.visible.filter((id) => id !== DOCUMENTS_BLOCK_ID);
    state.regions.mainRight.hidden.push(DOCUMENTS_BLOCK_ID);

    const payload = serializeLayout(state, DASHBOARD, dashboardRegistry, "B2B-store");
    const mainRight = payload.regions.find((region) => region.id === "mainRight");

    expect(mainRight?.blocks).toContainEqual({
      id: DOCUMENTS_BLOCK_ID,
      type: DOCUMENTS_BLOCK_ID,
      hidden: true,
      settings: [{ key: "maxRows", value: DOCUMENTS_DEFAULT_ROWS }],
    });
  });

  it("round-trips the hidden state through reconcileLayout", () => {
    const state = reconcileLayout(null, dashboardRegistry);
    state.regions.mainRight.visible = state.regions.mainRight.visible.filter((id) => id !== DOCUMENTS_BLOCK_ID);
    state.regions.mainRight.hidden.push(DOCUMENTS_BLOCK_ID);

    const readBack = reconcileLayout(serializeLayout(state, DASHBOARD, dashboardRegistry), dashboardRegistry);

    expect(readBack.regions.mainRight.hidden).toContain(DOCUMENTS_BLOCK_ID);
    expect(readBack.regions.mainRight.visible).not.toContain(DOCUMENTS_BLOCK_ID);
  });
});
