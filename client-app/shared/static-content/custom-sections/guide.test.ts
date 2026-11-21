import { describe, expect, it } from "vitest";
import guide from "./guide.md?raw";
import { getCustomSectionKit, registerBuiltInKit } from "./kit";
import { compileTemplate } from "./template";
import type { ICompiledElement, CompiledNodeType } from "./template";

const PATTERN_REGEX = /```html\n([\s\S]*?)```/g;

function collectClasses(node: CompiledNodeType): string[] {
  if ("text" in node) {
    return [];
  }

  const own = node.attributes.find(([name]) => name === "class")?.[1].join("") ?? "";
  return [...own.split(/\s+/).filter(Boolean), ...node.children.flatMap(collectClasses)];
}

describe("the section authors' guide", () => {
  registerBuiltInKit();
  const patterns = [...guide.matchAll(PATTERN_REGEX)].map((match) => match[1]);

  it("has the three patterns", () => {
    expect(patterns).toHaveLength(3);
  });

  it.each(patterns.map((pattern, index) => [index + 1, pattern]))(
    "pattern %i compiles as written, with the kit tags and behaviors it uses",
    (_, pattern) => {
      const compiled = compileTemplate(pattern, getCustomSectionKit());
      const root = compiled?.root as ICompiledElement;
      const type = collectClasses(root)[0];

      expect(compiled).toBeDefined();
      expect(collectClasses(root).every((name) => name === type || name.startsWith(`${type}__`))).toBe(true);
      expect(pattern.includes("data-count-up") ? [...(compiled?.behaviors ?? [])] : []).toEqual(
        pattern.includes("data-count-up") ? ["inview", "count-up"] : [],
      );
    },
  );
});
