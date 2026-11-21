import { afterEach, describe, expect, it, vi } from "vitest";
import { filterSectionCss } from "./css-filter";

const TYPE = "custom-hero";

function rulesOf(css: string): string {
  return filterSectionCss(TYPE, css)?.rules.replaceAll(/\s+/g, " ") ?? "";
}

describe("filterSectionCss", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps style rules and the conditional at-rules, nested rules included", () => {
    const rules = rulesOf(`
      :scope { display: grid; color: var(--color-primary-500); }
      .card { padding: 1rem; & .title { font-weight: 700; } }
      @media (min-width: 600px) { .card { padding: 2rem; } }
      @supports (display: grid) { .grid { display: grid; } }
      @container (min-width: 400px) { .card { gap: 1rem; } }
    `);

    expect(rules).toContain(":scope { display: grid; color: var(--color-primary-500); }");
    expect(rules).toContain(".title { font-weight: 700; }");
    expect(rules).toContain("@media (min-width: 600px)");
    expect(rules).toContain("@supports (display: grid)");
    expect(rules).toContain("@container (min-width: 400px)");
  });

  it("keeps the keyframes named {type}__… apart, and drops the others", () => {
    const filtered = filterSectionCss(
      TYPE,
      "@keyframes custom-hero__fade { from { opacity: 0; } to { opacity: 1; } } " +
        "@keyframes custom-hero-spin { to { rotate: 1turn; } } @keyframes spin { to { rotate: 1turn; } }",
    );

    expect(filtered?.keyframes).toContain("@keyframes custom-hero__fade");
    expect(filtered?.keyframes).not.toContain("spin");
    expect(filtered?.rules).toBe("");
  });

  it("keeps :dir() selectors and the logical properties", () => {
    const rule =
      ".a:dir(rtl) { margin-inline-start: 1rem; padding-inline: 1rem; inset-inline-start: 0px; text-align: start; " +
      "float: inline-start; border-inline-start: 1px solid currentcolor; }";

    expect(rulesOf(rule)).toBe(rule);
  });

  it("drops the at-rules the contract refuses", () => {
    const rules = rulesOf(`
      @import url("/x.css");
      @font-face { font-family: x; src: url("/x.woff"); }
      @layer base { .a { color: red; } }
      @page { margin: 0; }
      .kept { color: currentColor; }
    `);

    expect(rules).toBe(".kept { color: currentcolor; }");
  });

  it.each([":root", "html", "body .card", ".card, html .x", ":is(body) .y"])("drops a rule naming %s", (selector) => {
    expect(rulesOf(`${selector} { color: red; } .kept { margin: 0; }`)).toBe(".kept { margin: 0px; }");
  });

  it("keeps a class that only contains a refused name", () => {
    expect(rulesOf(".html-note, .body { margin: 0; }")).toBe(".html-note, .body { margin: 0px; }");
  });

  it("drops position: fixed, also through a variable, and keeps the other positions", () => {
    expect(rulesOf(".a { position: fixed; top: 0; } .b { position: var(--p); } .c { position: sticky; }")).toBe(
      ".a { top: 0px; } .b { } .c { position: sticky; }",
    );
  });

  it("keeps url() of an asset or an inline image and drops any other, in custom properties too", () => {
    const rules = rulesOf(`
      .a { background-image: url("/cms-content/assets/a.png"); }
      .b { background-image: url("https://cdn.example.com/b.png"); }
      .c { background-image: url("javascript:alert(1)"); }
      .d { --bg: url(data:image/png;base64,AAAA); }
      .e { --bg: url(data:text/html,x); }
    `);

    expect(rules).toContain('url("/cms-content/assets/a.png")');
    expect(rules).toContain('url("https://cdn.example.com/b.png")');
    expect(rules).toContain("url(data:image/png;base64,AAAA)");
    expect(rules).not.toContain("javascript");
    expect(rules).not.toContain("text/html");
  });

  it("keeps an image function naming allowed images, and drops one naming any other", () => {
    const rules = rulesOf(`
      .a { --bg: image-set("/a.png" 1x, url("/b.png") 2x); }
      .b { --bg: cross-fade(url("/a.png"), url("javascript:x")); }
      .c { --bg: src("https://evil.example/x.png"); }
      .d { --bg: image("data:text/html,x"); }
    `);

    expect(rules).toMatch(/^\.a \{ --bg: image-set\("\/a\.png" ?1x, ?url\("?\/b\.png"?\) ?2x\); \}/);
    expect(rules).not.toContain("javascript");
    expect(rules).not.toContain("text/html");
  });

  it.each([
    "image-set(var(--x) 1x)",
    "image(attr(data-x))",
    'cross-fade(url("/a.png"), image(env(x)))',
    "src(--pick())",
    "image-set(if(media(width > 1px): '/a.png'; else: '/b.png'))",
    String.raw`image-s\65t(var(--x) 1x)`,
    String.raw`\75rl(javascript:x)`,
  ])(
    "drops an image function that decides its address only as the page renders, or hides behind escapes: %s",
    (value) => {
      expect(rulesOf(`.a { --bg: ${value}; color: red; }`)).toBe(".a { color: red; }");
    },
  );

  it("drops what runs: expression(), element(), behavior and -moz-binding", () => {
    const rules = rulesOf(`
      .a { --bg: element(#secret); color: red; }
      .b { width: expression(alert(1)); }
    `);

    expect(rules).not.toContain("element(");
    expect(rules).not.toContain("expression");
    expect(rules).toContain("color: red");
  });

  it("keeps @starting-style, which the browser parses as a group of rules", () => {
    class FakeStartingStyleRule {
      cssRules: CSSRule[];
      cssText = "@starting-style { .a { opacity: 0; } }";

      constructor(rules: CSSRule[]) {
        this.cssRules = rules;
      }

      deleteRule(index: number): void {
        this.cssRules.splice(index, 1);
      }
    }
    const inner = new CSSStyleSheet();
    inner.replaceSync(".a { opacity: 0; }");
    const rule = new FakeStartingStyleRule([...inner.cssRules]);
    vi.stubGlobal("CSSStartingStyleRule", FakeStartingStyleRule);
    vi.stubGlobal(
      "CSSStyleSheet",
      class {
        cssRules = [rule];
        replaceSync(): void {}
      },
    );

    expect(filterSectionCss(TYPE, "@starting-style { .a { opacity: 0; } }")?.rules).toBe(rule.cssText);
  });

  it("gives no CSS where the browser cannot parse a stylesheet", () => {
    vi.stubGlobal("CSSStyleSheet", undefined);

    expect(filterSectionCss(TYPE, ".a { color: red; }")).toBeUndefined();
  });
});
