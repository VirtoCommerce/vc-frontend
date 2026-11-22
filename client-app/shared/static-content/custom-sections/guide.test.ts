import { describe, expect, it } from "vitest";
import { filterSectionCss } from "./css-filter";
import guide from "./guide.md?raw";
import { getCustomSectionBehaviors, getCustomSectionKit, registerBuiltInKit } from "./kit";
import { MAX_GUIDE_LENGTH } from "./kit/limits";
import { MAX_RENDERED_TEXT, MAX_TEMPLATE_ATTRIBUTES, RENDER_BUDGET } from "./limits";
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

  it("tells the render budget, what a repeating behavior's element holds counted twice", () => {
    expect(guide).toContain(`at most ${RENDER_BUDGET.toLocaleString("en-US")} elements and behaviors`);
    expect(guide.replaceAll(/\s+/g, " ")).toContain(
      "what an element with a repeating behavior (`data-marquee`) holds counts twice",
    );
    expect(guide).toContain(`at most ${MAX_RENDERED_TEXT.toLocaleString("en-US")} characters of settings`);
    expect(guide).toContain(`written with at most ${MAX_TEMPLATE_ATTRIBUTES} attributes`);
  });

  it("tells what the server refuses at save, what it only warns about, and what the storefront leaves out", () => {
    const intro = guide.split("\n## ")[0].replaceAll(/\s+/g, " ");

    expect(intro).toContain("When a section is saved or published, the server refuses one that breaks the rules below");
    expect(intro).toContain("an `h1`, an image without `alt`, a link with nothing to read, or `outline: none`");
    expect(intro).toContain(
      "A literal color, a physical side, a skipped heading level, motion outside `prefers-reduced-motion` and text " +
        "written into the template get only a warning.",
    );
    expect(intro).toContain("The storefront leaves out whatever still reaches a page against them.");
  });

  it("lists the four selector rules the filter holds", () => {
    const rules = guide.replaceAll(/\s+/g, " ");

    expect(rules).toContain("`:scope` or `&` only as the first thing of a selector, never inside a pseudo-class");
    expect(rules).toContain("no `:has()` whose selector starts with `+` or `~`");
    expect(rules).toContain("no `:nth-child(… of …)` or `:nth-last-child(… of …)` on `:scope` or `&`");
    expect(rules).toContain(
      "no combinator inside `:is()`, `:where()` or `:not()`, and no unknown functional pseudo-class",
    );
  });

  it("says which placements the color pair is checked in", () => {
    expect(guide.replaceAll(/\s+/g, " ")).toContain(
      "Publishing the theme checks that pair in its templates, header and footer against both the light and the dark " +
        "palette; a page is not checked, so pick a pair that holds in both.",
    );
  });

  it("keeps the focus style of an item at the section's edge inside its box", () => {
    expect(guide.replaceAll(/\s+/g, " ")).toContain(
      "The section clips what paints past its edge: give an item flush with that edge a focus style inside its box",
    );
  });

  it("names the design facts and the palette without the catalog's key paths, which the agent does not see", () => {
    expect(guide).not.toMatch(/kit\.(?:tags|behaviors|design)|paletteTokens/);
    expect(guide).toContain("`--vc-font-weight-*`");
  });

  it("writes a counter's value as its text too, which shows if the behavior fails to load", () => {
    const text = guide.replaceAll(/\s+/g, " ");

    expect(guide).toContain('data-count-up="{{ item.value }}">{{ item.value }}</span>');
    expect(text).toContain(
      "In an element with `data-count-up`, and in the `data-countdown-part` children of a countdown",
    );
    expect(text).toContain(
      "Write the value as the text too, as the stats pattern does: it shows if the behavior fails to load.",
    );
    expect(text).not.toContain("shows until the behavior loads");
  });

  it("stays within the server's cap on the guide it takes", () => {
    expect(guide.length).toBeLessThanOrEqual(MAX_GUIDE_LENGTH);
  });

  it("has the three patterns, each with its CSS", () => {
    expect(styles).toHaveLength(3);
  });

  it("tells what moment a date with no time means", () => {
    expect(guide.replaceAll(/\s+/g, " ")).toContain(
      "A countdown's date with no time ends at 00:00 UTC of that day, the same moment for every visitor.",
    );
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

      expect(filterSectionCss("custom-guide", css, "https://cdn.example.com/assets")?.rules).toBe(
        [...sheet.cssRules].map((rule) => rule.cssText).join("\n"),
      );
    },
  );
});
