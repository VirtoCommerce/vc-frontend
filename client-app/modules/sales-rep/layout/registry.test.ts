import { describe, expect, it } from "vitest";
import {
  CUSTOMER_PROFILE_LAYOUT_SCOPE,
  DASHBOARD_LAYOUT_SCOPE,
  DOCUMENTS_BLOCK_ID,
  DOCUMENTS_DEFAULT_ROWS,
  DOCUMENTS_MAX_ROWS,
  LAYOUT_REGION_IDS,
  LAYOUT_SCHEMA_VERSION,
} from "../constants";
import { documentsBlock } from "./documents-block";
import { getBlock, getBlockRegistry, registerBlock } from "./registry";
import type { SalesRepLayoutScopeType } from "../types/layout";

// The backend types `scope` and `region.id` as free-form `String`. An unrecognized value does not
// error — it addresses a different, empty document. Changing any literal below silently strands
// every layout already saved under the old one, so they are pinned rather than merely used.
describe("layout vocabulary", () => {
  it("pins the scope literals", () => {
    expect(DASHBOARD_LAYOUT_SCOPE).toBe("dashboard");
    expect(CUSTOMER_PROFILE_LAYOUT_SCOPE).toBe("customerProfile");
  });

  it("pins the region ids and their order", () => {
    expect(LAYOUT_REGION_IDS).toEqual(["statistics", "mainLeft", "mainRight"]);
  });

  it("pins the schema version", () => {
    expect(LAYOUT_SCHEMA_VERSION).toBe(1);
  });
});

describe("block registry", () => {
  const scopes: SalesRepLayoutScopeType[] = ["dashboard", "customerProfile"];

  it.each(scopes)("has unique block ids within %s", (scope) => {
    const ids = getBlockRegistry(scope).map((block) => block.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(scopes)("gives every block in %s a region the engine knows", (scope) => {
    const known = new Set<string>(LAYOUT_REGION_IDS);

    expect(getBlockRegistry(scope).every((block) => known.has(block.region))).toBe(true);
  });

  it.each(scopes)("gives every content widget in %s a component to render", (scope) => {
    const widgets = getBlockRegistry(scope).filter((block) => block.region !== "statistics");

    expect(widgets.length).toBeGreaterThan(0);
    expect(widgets.every((block) => "component" in block && Boolean(block.component))).toBe(true);
  });

  it("resolves a block by id", () => {
    expect(getBlock("customerProfile", "info")?.region).toBe("mainRight");
    expect(getBlock("customerProfile", "nope")).toBeUndefined();
  });

  // Mutates module state on purpose — kept last, with an id no real block uses.
  it("registers a late-shipped block and ignores a duplicate id", () => {
    const block = { id: "test-only-block", region: "mainLeft", titleKey: "x", order: 99, component: {} } as const;

    registerBlock("dashboard", block);
    expect(getBlock("dashboard", "test-only-block")).toBeDefined();

    registerBlock("dashboard", { ...block, titleKey: "changed" });
    expect(getBlock("dashboard", "test-only-block")?.titleKey).toBe("x");
  });
});

// Not in the registry defaults: init registers it only for reps carrying documents:read (VCST-5730),
// so the shape is pinned on the exported definition and the registration exercised here.
describe("documents block", () => {
  it("targets the dashboard right rail with a component and the 5/10 row cap", () => {
    expect(documentsBlock.id).toBe(DOCUMENTS_BLOCK_ID);
    expect(documentsBlock.region).toBe("mainRight");
    expect("component" in documentsBlock && Boolean(documentsBlock.component)).toBe(true);
    expect("settings" in documentsBlock && documentsBlock.settings).toEqual([
      { kind: "maxRows", default: DOCUMENTS_DEFAULT_ROWS, min: 1, max: DOCUMENTS_MAX_ROWS },
    ]);
  });

  // Mutates module state on purpose (like the late-shipped block above).
  it("registers into the dashboard without colliding with an existing id", () => {
    registerBlock("dashboard", documentsBlock);

    const ids = getBlockRegistry("dashboard").map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getBlock("dashboard", DOCUMENTS_BLOCK_ID)?.region).toBe("mainRight");
  });
});
