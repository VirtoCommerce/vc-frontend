import { describe, expect, it } from "vitest";
import {
  knownHiddenTabs,
  maxRowsSetting,
  parseSettings,
  serializeSettings,
  toggleTabRule,
  visibleTabRules,
} from "./settings";
import type { SalesRepBlockType, SavedLayoutSettingType } from "../types/layout";

const component = { name: "Stub" };

const orders: SalesRepBlockType = {
  id: "orders",
  region: "mainLeft",
  titleKey: "orders",
  order: 10,
  component,
  settings: [
    { kind: "maxRows", default: 5, min: 1, max: 20 },
    { kind: "ruleTabs", domain: "order" },
  ],
};

// Row cap only, and a tighter one — the top-seller API caps `take` at 10.
const topSellers: SalesRepBlockType = {
  id: "top_sellers",
  region: "mainLeft",
  titleKey: "top_sellers",
  order: 20,
  component,
  settings: [{ kind: "maxRows", default: 5, min: 1, max: 10 }],
};

const plain: SalesRepBlockType = { id: "stat-a", region: "statistics", titleKey: "a", order: 10 };

const rules = [{ name: "New" }, { name: "Processing" }, { name: "Completed" }];

describe("maxRowsSetting", () => {
  it("returns the block's own bounds, which differ per widget", () => {
    expect(maxRowsSetting(orders)?.max).toBe(20);
    expect(maxRowsSetting(topSellers)?.max).toBe(10);
  });

  it("is absent for a block that declares no row cap", () => {
    expect(maxRowsSetting(plain)).toBeUndefined();
    expect(maxRowsSetting(undefined)).toBeUndefined();
  });
});

describe("parseSettings", () => {
  it("falls back to the registry default when nothing was saved", () => {
    expect(parseSettings(orders, undefined)).toEqual({ maxRows: 5, hiddenTabs: [] });
  });

  it("reads a saved row cap", () => {
    expect(parseSettings(orders, [{ key: "maxRows", value: 12 }]).maxRows).toBe(12);
  });

  it.each([
    ["above the block's max", 99, 20],
    ["below the minimum", 0, 1],
    ["negative", -3, 1],
  ])("clamps a row cap %s", (_label, value, expected) => {
    expect(parseSettings(orders, [{ key: "maxRows", value }]).maxRows).toBe(expected);
  });

  it("clamps against the block's own bounds, not a shared range", () => {
    expect(parseSettings(topSellers, [{ key: "maxRows", value: 20 }]).maxRows).toBe(10);
  });

  it("truncates a fractional row cap rather than rendering half a row", () => {
    expect(parseSettings(orders, [{ key: "maxRows", value: 7.9 }]).maxRows).toBe(7);
  });

  it("accepts a numeric string, since the backend preserves whatever CLR type it stored", () => {
    expect(parseSettings(orders, [{ key: "maxRows", value: "8" }]).maxRows).toBe(8);
  });

  it.each([
    ["a non-numeric string", "lots"],
    ["a partly numeric string", "5 rows"],
    ["null", null],
    ["a boolean", true],
  ])("falls back to the default for %s", (_label, value) => {
    expect(parseSettings(orders, [{ key: "maxRows", value }]).maxRows).toBe(5);
  });

  it("collects one hidden tab per sibling key", () => {
    const saved: SavedLayoutSettingType[] = [
      { key: "tab.New", value: false },
      { key: "tab.Completed", value: false },
    ];

    expect(parseSettings(orders, saved).hiddenTabs).toEqual(["New", "Completed"]);
  });

  it("ignores a key the block does not declare", () => {
    // `maxRows` belongs to another block's vocabulary here, and tabs are not declared at all.
    expect(parseSettings(topSellers, [{ key: "tab.New", value: false }]).hiddenTabs).toEqual([]);
  });

  // Sent twice, a backend that stores one copy echoes one, and the fingerprints disagree — reporting a
  // save that succeeded as failed.
  it("collapses a name stored twice, so it cannot go back out twice", () => {
    const saved: SavedLayoutSettingType[] = [
      { key: "tab.New", value: false },
      { key: "tab.New", value: false },
    ];

    expect(parseSettings(orders, saved).hiddenTabs).toEqual(["New"]);
  });

  it("ignores a tab key that does not mean hidden", () => {
    expect(parseSettings(orders, [{ key: "tab.New", value: true }]).hiddenTabs).toEqual([]);
  });

  // The echo guard compares values stringified, so `false` and `"false"` look alike to it. Reading
  // them differently is what would let a save look agreed and read back reverted.
  it("treats a stringified false as hidden, matching what the echo guard cannot tell apart", () => {
    expect(parseSettings(orders, [{ key: "tab.New", value: "false" }]).hiddenTabs).toEqual(["New"]);
  });

  it("returns nothing configurable for a block with no declared settings", () => {
    expect(parseSettings(plain, [{ key: "maxRows", value: 9 }])).toEqual({ hiddenTabs: [] });
  });
});

describe("serializeSettings", () => {
  it("writes the row cap and one key per unchecked tab", () => {
    expect(serializeSettings(orders, { maxRows: 3, hiddenTabs: ["New"] })).toEqual([
      { key: "maxRows", value: 3 },
      { key: "tab.New", value: false },
    ]);
  });

  it("writes nothing for a checked tab, so a status added later needs no migration", () => {
    expect(serializeSettings(orders, { maxRows: 5, hiddenTabs: [] })).toEqual([{ key: "maxRows", value: 5 }]);
  });

  it("clamps on the way out too — a draft cannot persist a cap the backend will not honour", () => {
    expect(serializeSettings(topSellers, { maxRows: 40, hiddenTabs: [] })).toEqual([{ key: "maxRows", value: 10 }]);
  });

  it("drops a tab selection a block never declared", () => {
    expect(serializeSettings(topSellers, { maxRows: 5, hiddenTabs: ["New"] })).toEqual([{ key: "maxRows", value: 5 }]);
  });

  it("emits nothing for an unknown block or absent values", () => {
    expect(serializeSettings(undefined, { maxRows: 5, hiddenTabs: [] })).toEqual([]);
    expect(serializeSettings(orders, undefined)).toEqual([]);
  });

  it("round-trips through parseSettings", () => {
    const values = { maxRows: 9, hiddenTabs: ["Processing"] };

    expect(parseSettings(orders, serializeSettings(orders, values))).toEqual(values);
  });
});

describe("visibleTabRules", () => {
  it("keeps catalog order regardless of which tabs are hidden", () => {
    expect(visibleTabRules(rules, ["Processing"]).map((rule) => rule.name)).toEqual(["New", "Completed"]);
  });

  // The chips row keeps its "All" baseline regardless, so an empty rule set is a usable strip.
  it("offers no tabs when every rule is hidden", () => {
    expect(visibleTabRules(rules, ["New", "Processing", "Completed"])).toEqual([]);
  });

  it("ignores a hidden name the backend no longer returns", () => {
    expect(visibleTabRules(rules, ["Retired"]).map((rule) => rule.name)).toEqual(["New", "Processing", "Completed"]);
  });
});

describe("knownHiddenTabs", () => {
  it("drops a name the backend no longer returns", () => {
    expect(knownHiddenTabs(rules, ["Processing", "Retired"])).toEqual(["Processing"]);
  });

  // The rep hid New and Processing; Completed was retired, so every surviving rule is hidden. Both
  // names are still live, so neither may be pruned.
  it("keeps hidden names that are still live when every surviving rule is hidden", () => {
    const surviving = [{ name: "New" }, { name: "Processing" }];

    expect(knownHiddenTabs(surviving, ["New", "Processing"])).toEqual(["New", "Processing"]);
  });

  it("keeps the stored list when the catalog has not loaded", () => {
    expect(knownHiddenTabs([], ["New", "Processing"])).toEqual(["New", "Processing"]);
  });

  it("collapses a name stored twice", () => {
    expect(knownHiddenTabs(rules, ["New", "New"])).toEqual(["New"]);
  });
});

describe("toggleTabRule", () => {
  it("hides a shown rule", () => {
    expect(toggleTabRule([], "New")).toEqual(["New"]);
  });

  it("shows a hidden rule again", () => {
    expect(toggleTabRule(["New", "Completed"], "New")).toEqual(["Completed"]);
  });

  // The "All" baseline is always offered, so there is nothing to protect the rep from here.
  it("hides the last shown rule too", () => {
    expect(toggleTabRule(["New", "Processing"], "Completed")).toEqual(["New", "Processing", "Completed"]);
  });
});
