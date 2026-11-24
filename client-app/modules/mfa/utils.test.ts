import { describe, expect, it } from "vitest";
import { hasMfaSchema } from "./utils";

describe("hasMfaSchema", () => {
  it.each([
    ["3.1000.0", false],
    ["3.1000.1", false],
    ["3.1000.2", true],
    ["3.1000.3", true],
    ["3.1001.0", false],
    ["3.1001.5", false],
    ["3.1002.0", true],
    ["3.1010.1", true],
    ["3.999.0", false],
  ])("%s has the schema: %s", (version, expected) => {
    expect(hasMfaSchema(version)).toBe(expected);
  });
});
