import { describe, expect, it } from "vitest";
import { checkFieldValue } from "./fields";
import type { ICustomSectionField } from "../types";

describe("checkFieldValue", () => {
  it.each<[ICustomSectionField, string, unknown]>([
    [{ type: "string" }, "Any text", "Any text"],
    [{ type: "number", min: 1, max: 24 }, "24", 24],
    [{ type: "number", min: 1, max: 24 }, "25", undefined],
    [{ type: "number", min: 1 }, "0", undefined],
    [{ type: "number" }, "many", undefined],
    [{ type: "number" }, "", undefined],
    [{ type: "boolean" }, "", true],
    [{ type: "boolean" }, "false", false],
    [{ type: "select", options: ["grid", "carousel"] }, "carousel", "carousel"],
    [{ type: "select", options: ["grid", "carousel"] }, "list", undefined],
    [{ type: "link" }, "/catalog", "/catalog"],
    [{ type: "link" }, "javascript:alert(1)", undefined],
    [{ type: "date" }, "2026-12-31", "2026-12-31"],
    [{ type: "date" }, "2026-12-31T18:00:00Z", "2026-12-31T18:00:00Z"],
    [{ type: "date" }, "next friday", undefined],
    [{ type: "date" }, "2026-13-45", undefined],
  ])("checks %j against %j: %j", (field, value, expected) => {
    expect(checkFieldValue(field, value)).toBe(expected);
  });
});
