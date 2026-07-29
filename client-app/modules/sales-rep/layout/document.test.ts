import { describe, expect, it } from "vitest";
import { LAYOUT_SCHEMA_VERSION } from "../constants";
import { echoCoversSentBlocks, reconcileLayout, serializeLayout } from "./document";
import type { SalesRepBlockType, SalesRepLayoutStateType, SavedLayoutType } from "../types/layout";

// A stand-in component; reconciliation never touches it, it only satisfies the widget-block type.
const component = { name: "Stub" };

const registry: SalesRepBlockType[] = [
  { id: "stat-a", region: "statistics", titleKey: "a", order: 10 },
  { id: "stat-b", region: "statistics", titleKey: "b", order: 20 },
  { id: "stat-c", region: "statistics", titleKey: "c", order: 30, defaultHidden: true },
  { id: "orders", region: "mainLeft", titleKey: "orders", order: 10, component },
  { id: "news", region: "mainLeft", titleKey: "news", order: 20, component },
  { id: "actions", region: "mainRight", titleKey: "actions", order: 10, component },
];

function doc(...blocks: [type: string, hidden: boolean][]): SavedLayoutType {
  return { regions: [{ blocks: blocks.map(([type, hidden]) => ({ type, hidden })) }] };
}

const ids = (region: SalesRepLayoutStateType[keyof SalesRepLayoutStateType]) => [...region.visible, ...region.hidden];

describe("reconcileLayout", () => {
  it("returns registry defaults when nothing was ever saved", () => {
    const state = reconcileLayout(null, registry);

    expect(ids(state.statistics)).toEqual(["stat-a", "stat-b", "stat-c"]);
    expect(ids(state.mainLeft)).toEqual(["orders", "news"]);
    expect(ids(state.mainRight)).toEqual(["actions"]);
  });

  it("honours defaultHidden for a never-saved layout", () => {
    const state = reconcileLayout(null, registry);

    expect(state.statistics.visible).toEqual(["stat-a", "stat-b"]);
    expect(state.statistics.hidden).toEqual(["stat-c"]);
  });

  it("preserves the saved order within a region", () => {
    const state = reconcileLayout(doc(["stat-b", false], ["stat-c", false], ["stat-a", false]), registry);

    expect(ids(state.statistics)).toEqual(["stat-b", "stat-c", "stat-a"]);
  });

  it("preserves the saved hidden flag over the registry default", () => {
    // stat-c defaults to hidden; the rep un-hid it. stat-a defaults visible; the rep hid it.
    const state = reconcileLayout(doc(["stat-a", true], ["stat-c", false]), registry);

    expect(state.statistics.hidden).toContain("stat-a");
    expect(state.statistics.visible).toContain("stat-c");
  });

  it("drops a persisted block that is no longer in the registry", () => {
    const state = reconcileLayout(doc(["orders", false], ["retired-widget", false]), registry);

    expect(ids(state.mainLeft)).toEqual(["orders", "news"]);
  });

  it("appends a registry block missing from the document, after the arranged ones", () => {
    // The rep saved only `news`; `orders` shipped later and must not displace their arrangement.
    const state = reconcileLayout(doc(["news", false]), registry);

    expect(ids(state.mainLeft)).toEqual(["news", "orders"]);
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

    expect(ids(state.statistics)).toEqual(["stat-a", "stat-b", "stat-c"]);
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

    expect(ids(state.mainRight)).toEqual(["actions"]);
    expect(ids(state.mainLeft)).toEqual(["orders", "news"]);
  });

  it("collapses a duplicated type to its first occurrence", () => {
    const state = reconcileLayout(doc(["orders", true], ["orders", false]), registry);

    expect(ids(state.mainLeft)).toEqual(["news", "orders"]);
    expect(state.mainLeft.hidden).toEqual(["orders"]);
  });

  it("yields empty regions for an empty registry", () => {
    expect(reconcileLayout(doc(["orders", false]), [])).toEqual({
      statistics: { visible: [], hidden: [] },
      mainLeft: { visible: [], hidden: [] },
      mainRight: { visible: [], hidden: [] },
    });
  });
});

describe("serializeLayout", () => {
  const state = reconcileLayout(null, registry);

  it("emits every region in a stable order", () => {
    expect(serializeLayout(state, "dashboard").regions.map((r) => r.id)).toEqual([
      "statistics",
      "mainLeft",
      "mainRight",
    ]);
  });

  it("includes hidden blocks, since a save is a full-document replace", () => {
    const statistics = serializeLayout(state, "dashboard").regions.find((r) => r.id === "statistics");

    expect(statistics?.blocks.map((b) => b.type)).toEqual(["stat-a", "stat-b", "stat-c"]);
    expect(statistics?.blocks.find((b) => b.type === "stat-c")?.hidden).toBe(true);
  });

  it("writes the same value to id and type", () => {
    const block = serializeLayout(state, "dashboard").regions.flatMap((r) => r.blocks)[0];

    expect(block.id).toBe(block.type);
  });

  it("sends an empty settings list — v1 persists order and visibility only", () => {
    const blocks = serializeLayout(state, "dashboard").regions.flatMap((r) => r.blocks);

    expect(blocks.every((b) => b.settings.length === 0)).toBe(true);
  });

  it("carries scope, storeId and schema version", () => {
    const payload = serializeLayout(state, "customerProfile", "B2B-store");

    expect(payload).toMatchObject({
      scope: "customerProfile",
      storeId: "B2B-store",
      schemaVersion: LAYOUT_SCHEMA_VERSION,
    });
  });

  it("round-trips through reconcileLayout unchanged", () => {
    const rearranged = reconcileLayout(doc(["news", false], ["orders", true]), registry);

    expect(reconcileLayout(serializeLayout(rearranged, "dashboard"), registry)).toEqual(rearranged);
  });

  it("round-trips a layout with every block hidden", () => {
    const allHidden = reconcileLayout(
      doc(["stat-a", true], ["stat-b", true], ["stat-c", true], ["orders", true], ["news", true], ["actions", true]),
      registry,
    );

    expect(Object.values(allHidden).every((region) => region.visible.length === 0)).toBe(true);
    expect(reconcileLayout(serializeLayout(allHidden, "dashboard"), registry)).toEqual(allHidden);
  });
});

// Guards the save path: reconciling a document that is missing blocks fills the gaps from registry
// defaults, which would read as "the rep arranged nothing" and overwrite what they actually did.
describe("echoCoversSentBlocks", () => {
  const sent = serializeLayout(reconcileLayout(null, registry), "dashboard");

  it("accepts an echo carrying every block that was sent", () => {
    expect(echoCoversSentBlocks(sent as unknown as SavedLayoutType, sent)).toBe(true);
  });

  it("accepts an echo that regrouped the blocks across regions", () => {
    const flattened: SavedLayoutType = { regions: [{ blocks: sent.regions.flatMap((region) => region.blocks) }] };

    expect(echoCoversSentBlocks(flattened, sent)).toBe(true);
  });

  it.each([
    ["no regions at all", { regions: [] }],
    ["regions but no blocks", { regions: [{ blocks: [] }] }],
    ["null", null],
    ["undefined", undefined],
  ])("rejects an echo with %s", (_label, echo) => {
    expect(echoCoversSentBlocks(echo as SavedLayoutType | null | undefined, sent)).toBe(false);
  });

  it("rejects an echo that dropped a single block", () => {
    const short: SavedLayoutType = {
      regions: sent.regions.map((region) => ({ blocks: region.blocks.slice(1) })),
    };

    expect(echoCoversSentBlocks(short, sent)).toBe(false);
  });
});
