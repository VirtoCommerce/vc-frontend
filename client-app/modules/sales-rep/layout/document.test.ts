import { describe, expect, it } from "vitest";
import { LAYOUT_SCHEMA_VERSION } from "../constants";
import { echoMatchesSentBlocks, reconcileLayout, serializeLayout } from "./document";
import type {
  SalesRepLayoutRegionType,
  SalesRepBlockType,
  SavedLayoutSettingType,
  SavedLayoutType,
} from "../types/layout";

// A stand-in component; reconciliation never touches it, it only satisfies the widget-block type.
const component = { name: "Stub" };

const registry: SalesRepBlockType[] = [
  { id: "stat-a", region: "statistics", titleKey: "a", order: 10 },
  { id: "stat-b", region: "statistics", titleKey: "b", order: 20 },
  { id: "stat-c", region: "statistics", titleKey: "c", order: 30, defaultHidden: true },
  {
    id: "orders",
    region: "mainLeft",
    titleKey: "orders",
    order: 10,
    component,
    settings: [
      { kind: "maxRows", default: 5, min: 1, max: 20 },
      { kind: "ruleTabs", domain: "order" },
    ],
  },
  { id: "news", region: "mainLeft", titleKey: "news", order: 20, component },
  { id: "actions", region: "mainRight", titleKey: "actions", order: 10, component },
];

function doc(...blocks: [type: string, hidden: boolean, settings?: SavedLayoutSettingType[]][]): SavedLayoutType {
  return { regions: [{ blocks: blocks.map(([type, hidden, settings]) => ({ type, hidden, settings })) }] };
}

const ids = (region: SalesRepLayoutRegionType) => [...region.visible, ...region.hidden];

describe("reconcileLayout", () => {
  it("returns registry defaults when nothing was ever saved", () => {
    const state = reconcileLayout(null, registry);

    expect(ids(state.regions.statistics)).toEqual(["stat-a", "stat-b", "stat-c"]);
    expect(ids(state.regions.mainLeft)).toEqual(["orders", "news"]);
    expect(ids(state.regions.mainRight)).toEqual(["actions"]);
  });

  it("honours defaultHidden for a never-saved layout", () => {
    const state = reconcileLayout(null, registry);

    expect(state.regions.statistics.visible).toEqual(["stat-a", "stat-b"]);
    expect(state.regions.statistics.hidden).toEqual(["stat-c"]);
  });

  it("preserves the saved order within a region", () => {
    const state = reconcileLayout(doc(["stat-b", false], ["stat-c", false], ["stat-a", false]), registry);

    expect(ids(state.regions.statistics)).toEqual(["stat-b", "stat-c", "stat-a"]);
  });

  it("preserves the saved hidden flag over the registry default", () => {
    // stat-c defaults to hidden; the rep un-hid it. stat-a defaults visible; the rep hid it.
    const state = reconcileLayout(doc(["stat-a", true], ["stat-c", false]), registry);

    expect(state.regions.statistics.hidden).toContain("stat-a");
    expect(state.regions.statistics.visible).toContain("stat-c");
  });

  it("drops a persisted block that is no longer in the registry", () => {
    const state = reconcileLayout(doc(["orders", false], ["retired-widget", false]), registry);

    expect(ids(state.regions.mainLeft)).toEqual(["orders", "news"]);
  });

  it("appends a registry block missing from the document, after the arranged ones", () => {
    // The rep saved only `news`; `orders` shipped later and must not displace their arrangement.
    const state = reconcileLayout(doc(["news", false]), registry);

    expect(ids(state.regions.mainLeft)).toEqual(["news", "orders"]);
  });

  // Declared out of sequence deliberately: `registry.filter` preserves array order, so against an
  // already-ascending registry the sort is invisible and deleting it fails nothing. `registerBlock`
  // appends, so a widget registered later with a low `order` depends on this.
  it("orders several newcomers among themselves by order, not by array position", () => {
    const shuffled: SalesRepBlockType[] = [
      { id: "stat-c", region: "statistics", titleKey: "c", order: 30 },
      { id: "stat-a", region: "statistics", titleKey: "a", order: 10 },
      { id: "stat-b", region: "statistics", titleKey: "b", order: 20 },
    ];

    const state = reconcileLayout(doc(["orders", false]), shuffled);

    expect(ids(state.regions.statistics)).toEqual(["stat-a", "stat-b", "stat-c"]);
  });

  it("takes region from the registry, ignoring the region the block was saved under", () => {
    // `actions` is a mainRight block in the registry but was persisted alongside mainLeft blocks.
    const moved: SavedLayoutType = {
      regions: [
        {
          blocks: [
            { type: "actions", hidden: false },
            { type: "orders", hidden: false },
          ],
        },
        { blocks: [] },
      ],
    };
    const state = reconcileLayout(moved, registry);

    expect(ids(state.regions.mainRight)).toEqual(["actions"]);
    expect(ids(state.regions.mainLeft)).toEqual(["orders", "news"]);
  });

  it("collapses a duplicated type to its first occurrence", () => {
    const state = reconcileLayout(doc(["orders", true], ["orders", false]), registry);

    expect(ids(state.regions.mainLeft)).toEqual(["news", "orders"]);
    expect(state.regions.mainLeft.hidden).toEqual(["orders"]);
  });

  it("yields empty regions for an empty registry", () => {
    expect(reconcileLayout(doc(["orders", false]), [])).toEqual({
      regions: {
        statistics: { visible: [], hidden: [] },
        mainLeft: { visible: [], hidden: [] },
        mainRight: { visible: [], hidden: [] },
      },
      settings: {},
    });
  });

  it("carries settings only for the blocks that declare them", () => {
    const state = reconcileLayout(null, registry);

    expect(Object.keys(state.settings)).toEqual(["orders"]);
    expect(state.settings.orders).toEqual({ maxRows: 5, hiddenTabs: [] });
  });

  it("reads a block's persisted settings back out of the document", () => {
    const state = reconcileLayout(
      doc([
        "orders",
        false,
        [
          { key: "maxRows", value: 12 },
          { key: "tab.New", value: false },
        ],
      ]),
      registry,
    );

    expect(state.settings.orders).toEqual({ maxRows: 12, hiddenTabs: ["New"] });
  });
});

describe("serializeLayout", () => {
  const state = reconcileLayout(null, registry);

  it("emits every region in a stable order", () => {
    expect(serializeLayout(state, "dashboard", registry).regions.map((r) => r.id)).toEqual([
      "statistics",
      "mainLeft",
      "mainRight",
    ]);
  });

  it("includes hidden blocks, since a save is a full-document replace", () => {
    const statistics = serializeLayout(state, "dashboard", registry).regions.find((r) => r.id === "statistics");

    expect(statistics?.blocks.map((b) => b.type)).toEqual(["stat-a", "stat-b", "stat-c"]);
    expect(statistics?.blocks.find((b) => b.type === "stat-c")?.hidden).toBe(true);
  });

  it("writes the same value to id and type", () => {
    const block = serializeLayout(state, "dashboard", registry).regions.flatMap((r) => r.blocks)[0];

    expect(block.id).toBe(block.type);
  });

  it("sends an empty settings list for a block that declares none", () => {
    const blocks = serializeLayout(state, "dashboard", registry).regions.flatMap((r) => r.blocks);

    expect(blocks.filter((b) => b.type !== "orders").every((b) => b.settings.length === 0)).toBe(true);
  });

  it("sends each configurable block's settings as scalars, one sibling key per unchecked tab", () => {
    const configured = reconcileLayout(
      doc([
        "orders",
        false,
        [
          { key: "maxRows", value: 3 },
          { key: "tab.New", value: false },
        ],
      ]),
      registry,
    );
    const orders = serializeLayout(configured, "dashboard", registry)
      .regions.flatMap((r) => r.blocks)
      .find((b) => b.type === "orders");

    expect(orders?.settings).toEqual([
      { key: "maxRows", value: 3 },
      { key: "tab.New", value: false },
    ]);
  });

  it("carries scope, storeId and schema version", () => {
    const payload = serializeLayout(state, "customerProfile", registry, "B2B-store");

    expect(payload).toMatchObject({
      scope: "customerProfile",
      storeId: "B2B-store",
      schemaVersion: LAYOUT_SCHEMA_VERSION,
    });
  });

  it("round-trips through reconcileLayout unchanged", () => {
    const rearranged = reconcileLayout(doc(["news", false], ["orders", true]), registry);

    expect(reconcileLayout(serializeLayout(rearranged, "dashboard", registry), registry)).toEqual(rearranged);
  });

  it("round-trips a layout with every block hidden", () => {
    const allHidden = reconcileLayout(
      doc(["stat-a", true], ["stat-b", true], ["stat-c", true], ["orders", true], ["news", true], ["actions", true]),
      registry,
    );

    expect(Object.values(allHidden.regions).every((region) => region.visible.length === 0)).toBe(true);
    expect(reconcileLayout(serializeLayout(allHidden, "dashboard", registry), registry)).toEqual(allHidden);
  });
});

// Two ways an echo can lie: omit blocks, or return them all with the wrong `hidden`.
describe("echoMatchesSentBlocks", () => {
  const sent = serializeLayout(reconcileLayout(null, registry), "dashboard", registry);

  it("accepts an echo carrying every block that was sent", () => {
    expect(echoMatchesSentBlocks(sent as unknown as SavedLayoutType, sent)).toBe(true);
  });

  it("accepts an echo that regrouped the blocks across regions", () => {
    const flattened: SavedLayoutType = { regions: [{ blocks: sent.regions.flatMap((region) => region.blocks) }] };

    expect(echoMatchesSentBlocks(flattened, sent)).toBe(true);
  });

  it.each([
    ["no regions at all", { regions: [] }],
    ["regions but no blocks", { regions: [{ blocks: [] }] }],
    ["null", null],
    ["undefined", undefined],
  ])("rejects an echo with %s", (_label, echo) => {
    expect(echoMatchesSentBlocks(echo as SavedLayoutType | null | undefined, sent)).toBe(false);
  });

  it("rejects an echo that dropped a single block", () => {
    const short: SavedLayoutType = {
      regions: sent.regions.map((region) => ({ blocks: region.blocks.slice(1) })),
    };

    expect(echoMatchesSentBlocks(short, sent)).toBe(false);
  });

  // Every type present, one flag inverted — the case a presence-only check waves through.
  it("rejects an echo that returns every block but contradicts a hidden flag", () => {
    const flipped: SavedLayoutType = {
      regions: sent.regions.map((region, index) => ({
        blocks: region.blocks.map((block, position) =>
          index === 0 && position === 0 ? { type: block.type, hidden: !block.hidden } : block,
        ),
      })),
    };

    expect(echoMatchesSentBlocks(flipped, sent)).toBe(false);
  });

  // A dropped setting reverts a row cap or a tab choice as silently as a reverted hide.
  it("rejects an echo that returns every block but drops a setting", () => {
    const stripped: SavedLayoutType = {
      regions: sent.regions.map((region) => ({
        blocks: region.blocks.map((block) => ({ type: block.type, hidden: block.hidden, settings: [] })),
      })),
    };

    expect(echoMatchesSentBlocks(stripped, sent)).toBe(false);
  });

  // Reconciliation keeps the FIRST copy of a duplicated type, so agreeing with any single copy would
  // let the rep end up looking at a block the guard never checked.
  it("rejects an echo that returns the same block type twice", () => {
    const duplicated: SavedLayoutType = {
      regions: [
        { blocks: sent.regions.flatMap((region) => region.blocks) },
        { blocks: [sent.regions.flatMap((region) => region.blocks)[0]] },
      ],
    };

    expect(echoMatchesSentBlocks(duplicated, sent)).toBe(false);
  });

  it("accepts an echo that returns the settings in a different order", () => {
    const shuffled: SavedLayoutType = {
      regions: sent.regions.map((region) => ({
        blocks: region.blocks.map((block) => ({ ...block, settings: [...block.settings].reverse() })),
      })),
    };

    expect(echoMatchesSentBlocks(shuffled, sent)).toBe(true);
  });
});
