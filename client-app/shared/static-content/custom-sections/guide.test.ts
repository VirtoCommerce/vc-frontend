import { describe, expect, it } from "vitest";
import { filterSectionCss } from "./css-filter";
import guide from "./guide.md?raw";
import { getCustomSectionBehaviors, getCustomSectionKit, registerBuiltInKit } from "./kit";
import { MAX_GUIDE_LENGTH } from "./kit/limits";
import { MAX_RENDERED_TEXT, RENDER_BUDGET } from "./limits";
import { compileTemplate } from "./template";
import type { ICompiledElement, CompiledNodeType } from "./template";

const PATTERN_REGEX = /```html\n([\s\S]*?)```/g;
const CSS_REGEX = /```css\n([\s\S]*?)```/g;

function collectClasses(node: CompiledNodeType): string[] {
  if ("text" in node) {
    return [];
  }

  const own = node.attributes.find(([name]) => name === "class")?.[1].join("") ?? "";
  return [...own.split(/\s+/).filter(Boolean), ...node.children.flatMap(collectClasses)];
}

function getWrittenBehaviors(pattern: string): string[] {
  return Object.keys(getCustomSectionBehaviors()).filter((name) =>
    new RegExp(String.raw`\sdata-${name}(?![\w-])`).test(pattern),
  );
}

describe("the section authors' guide", () => {
  registerBuiltInKit();
  const patterns = [...guide.matchAll(PATTERN_REGEX)].map((match) => match[1]);
  const styles = [...guide.matchAll(CSS_REGEX)].map((match) => match[1]);

  it("tells the render budget, the children of a repeating behavior counted twice", () => {
    expect(guide).toContain(`at most ${RENDER_BUDGET.toLocaleString("en-US")} elements and behaviors`);
    expect(guide).toMatch(/children of a repeating behavior \(`data-marquee`\) count twice/);
    expect(guide).toContain(`at most ${MAX_RENDERED_TEXT.toLocaleString("en-US")} characters of settings`);
  });

  it("tells what the server refuses and what it only warns about", () => {
    const intro = guide.split("\n## ")[0].replaceAll(/\s+/g, " ");

    expect(intro).toContain(
      "the server also refuses an `h1`, an image without `alt`, a link with nothing to read and `outline: none`",
    );
    expect(intro).toContain("a literal color, a physical side, a skipped heading level and motion");
  });

  it("writes a counter's value as its text too, shown until the behavior loads", () => {
    expect(guide).toContain('data-count-up="{{ item.value }}">{{ item.value }}</span>');
    expect(guide.replaceAll(/\s+/g, " ")).toContain(
      "That text shows until the behavior loads, and stays if it fails to load.",
    );
  });

  it("stays within the server's cap on the guide it takes", () => {
    expect(guide.length).toBeLessThanOrEqual(MAX_GUIDE_LENGTH);
  });

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
      expect(compiled?.behaviors).toEqual(new Set(getWrittenBehaviors(pattern)));
    },
  );

  it.each(styles.map((css, index) => [index + 1, css]))(
    "pattern %i's CSS passes the storefront's filter whole",
    (_, css) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);

      expect(styles).toHaveLength(patterns.length);
      expect(filterSectionCss("custom-guide", css, "https://cdn.example.com/assets")?.rules).toBe(
        [...sheet.cssRules].map((rule) => rule.cssText).join("\n"),
      );
    },
  );
});
