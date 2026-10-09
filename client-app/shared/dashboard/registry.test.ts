import { describe, expect, it, vi } from "vitest";
import { computed } from "vue";
import { Logger } from "@/core/utilities";
import {
  LAYOUT_REGION_IDS,
  LAYOUT_SCHEMA_VERSION,
  LAYOUT_SCOPES,
  SETTING_HIDDEN_TAB_PREFIX,
  SETTING_MAX_ROWS,
} from "./constants";
import { getBlock, getBlockRegistry, registerBlock, unregisterBlock } from "./registry";
import type { BlockType } from "./types";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

// Backends type the scope and `region.id` as free-form strings and the settings as free-form keys. An
// unrecognized value does not error — it addresses a different, empty document or slot of one. Changing any
// literal below silently strands every layout already saved under the old one, so they are pinned rather
// than merely used.
describe("layout vocabulary", () => {
  it("pins the dashboard scopes", () => {
    expect(LAYOUT_SCOPES).toEqual({
      accountDashboard: "accountDashboard",
      salesRepDashboard: "salesRepDashboard",
      salesRepCustomerProfile: "salesRepCustomerProfile",
    });
  });

  it("pins the region ids and their order", () => {
    expect(LAYOUT_REGION_IDS).toEqual(["statistics", "mainLeft", "mainRight"]);
  });

  it("pins the schema version", () => {
    expect(LAYOUT_SCHEMA_VERSION).toBe(1);
  });

  it("pins the setting keys", () => {
    expect(SETTING_MAX_ROWS).toBe("maxRows");
    expect(SETTING_HIDDEN_TAB_PREFIX).toBe("tab.");
  });
});

const widget = (id: string, overrides: Partial<BlockType> = {}): BlockType => ({
  id,
  region: "mainLeft",
  titleKey: `test.${id}`,
  order: 10,
  component: {},
  ...overrides,
});

describe("block registry", () => {
  it("creates a dashboard with its first block, in registration order", () => {
    registerBlock("registrySpecA", widget("first"));
    registerBlock("registrySpecA", widget("second", { order: 5 }));

    expect(getBlockRegistry("registrySpecA").map((block) => block.id)).toEqual(["first", "second"]);
  });

  it("knows nothing of a dashboard no block was registered on", () => {
    expect(getBlockRegistry("registrySpecNowhere")).toEqual([]);
    expect(getBlock("registrySpecNowhere", "first")).toBeUndefined();
  });

  it("keeps dashboards apart", () => {
    registerBlock("registrySpecB", widget("shared-id"));
    registerBlock("registrySpecC", widget("shared-id", { titleKey: "test.other" }));

    expect(getBlock("registrySpecB", "shared-id")?.titleKey).toBe("test.shared-id");
    expect(getBlock("registrySpecC", "shared-id")?.titleKey).toBe("test.other");
  });

  // Ids are persisted as `block.type`, so two blocks under one id would collide in every saved document. The
  // first one wins and the second is reported, not silently dropped.
  it("ignores a second block with a taken id, and warns about it", () => {
    registerBlock("registrySpecD", widget("taken"));
    registerBlock("registrySpecD", widget("taken", { titleKey: "test.changed" }));

    expect(getBlockRegistry("registrySpecD")).toHaveLength(1);
    expect(getBlock("registrySpecD", "taken")?.titleKey).toBe("test.taken");
    expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('"taken"'));
  });

  it("unregisters a block, and leaves the rest of the dashboard alone", () => {
    registerBlock("registrySpecE", widget("keep"));
    registerBlock("registrySpecE", widget("drop"));

    unregisterBlock("registrySpecE", "drop");
    unregisterBlock("registrySpecE", "never-registered");

    expect(getBlockRegistry("registrySpecE").map((block) => block.id)).toEqual(["keep"]);
  });

  // A dashboard's skeleton and reconciled layout read the registry inside computeds; a block registered after
  // they first ran must still reach them.
  it("is reactive", () => {
    const ids = computed(() => getBlockRegistry("registrySpecF").map((block) => block.id));
    expect(ids.value).toEqual([]);

    registerBlock("registrySpecF", widget("late"));
    expect(ids.value).toEqual(["late"]);

    unregisterBlock("registrySpecF", "late");
    expect(ids.value).toEqual([]);
  });
});
