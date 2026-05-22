import { parse, print } from "graphql";
import { describe, expect, it } from "vitest";
import { applyGates } from "./apply-gates";

function normalize(query: string): string {
  return print(parse(query));
}

describe("applyGates", () => {
  it("strips fields whose module is not installed", () => {
    const source = `
      query Q {
        pageContext {
          user { id }
          whiteLabelingSettings @gate(module: "VirtoCommerce.WhiteLabeling") {
            logoUrl
          }
        }
      }
    `;
    const expected = `
      query Q {
        pageContext {
          user { id }
        }
      }
    `;

    const result = applyGates(parse(source), new Set());

    expect(print(result)).toBe(normalize(expected));
  });

  it("keeps gated fields and removes the directive when module is installed", () => {
    const source = `
      query Q {
        pageContext {
          whiteLabelingSettings @gate(module: "VirtoCommerce.WhiteLabeling") {
            logoUrl
          }
        }
      }
    `;
    const expected = `
      query Q {
        pageContext {
          whiteLabelingSettings {
            logoUrl
          }
        }
      }
    `;

    const result = applyGates(parse(source), new Set(["VirtoCommerce.WhiteLabeling"]));

    expect(print(result)).toBe(normalize(expected));
  });

  it("leaves untouched documents without @gate", () => {
    const source = `
      query Q {
        pageContext {
          user { id }
        }
      }
    `;

    const result = applyGates(parse(source), new Set());

    expect(print(result)).toBe(normalize(source));
  });

  it("removes orphan fragment definitions when their only consumer is stripped", () => {
    const source = `
      query Q {
        pageContext {
          user { id }
          whiteLabelingSettings @gate(module: "M") {
            ...whiteLabelingFields
          }
        }
      }
      fragment whiteLabelingFields on WhiteLabelingSettingsType {
        logoUrl
      }
    `;
    const expected = `
      query Q {
        pageContext {
          user { id }
        }
      }
    `;

    const result = applyGates(parse(source), new Set());

    expect(print(result)).toBe(normalize(expected));
  });

  it("removes transitively orphaned fragments", () => {
    const source = `
      query Q {
        keep { id }
        a @gate(module: "M") { ...outer }
      }
      fragment outer on A {
        nested {
          ...inner
        }
      }
      fragment inner on B {
        id
      }
    `;
    const expected = `
      query Q {
        keep { id }
      }
    `;

    const result = applyGates(parse(source), new Set());

    expect(print(result)).toBe(normalize(expected));
  });

  it("keeps fragments that are still used by other selections", () => {
    const source = `
      query Q {
        a { ...shared }
        b @gate(module: "M") { ...shared }
      }
      fragment shared on T {
        id
      }
    `;
    const expected = `
      query Q {
        a { ...shared }
      }
      fragment shared on T {
        id
      }
    `;

    const result = applyGates(parse(source), new Set());

    expect(print(result)).toBe(normalize(expected));
  });

  it("handles multiple gated fields with different modules independently", () => {
    const source = `
      query Q {
        a @gate(module: "ModuleA") { id }
        b @gate(module: "ModuleB") { id }
        c { id }
      }
    `;
    const expected = `
      query Q {
        a { id }
        c { id }
      }
    `;

    const result = applyGates(parse(source), new Set(["ModuleA"]));

    expect(print(result)).toBe(normalize(expected));
  });
});
