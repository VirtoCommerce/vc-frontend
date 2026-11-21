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

  it("keeps the keyframes named after the type apart, and drops the others", () => {
    const filtered = filterSectionCss(
      TYPE,
      "@keyframes custom-hero-fade { from { opacity: 0; } to { opacity: 1; } } @keyframes spin { to { rotate: 1turn; } }",
    );

    expect(filtered?.keyframes).toContain("@keyframes custom-hero-fade");
    expect(filtered?.keyframes).not.toContain("spin");
    expect(filtered?.rules).toBe("");
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

  it("keeps url() of the asset library and drops any other, in custom properties too", () => {
    const rules = rulesOf(`
      .a { background-image: url("/cms-content/assets/a.png"); }
      .b { background-image: url("https://cdn.example.com/b.png"); }
      .c { background-image: url("javascript:alert(1)"); }
      .d { --bg: url(data:image/png;base64,AAAA); }
    `);

    expect(rules).toContain('url("/cms-content/assets/a.png")');
    expect(rules).toContain('url("https://cdn.example.com/b.png")');
    expect(rules).not.toContain("javascript");
    expect(rules).not.toContain("data:");
  });

  it("drops what loads or runs without url(): image-set(), expression(), behavior and -moz-binding", () => {
    const rules = rulesOf(`
      .a { background-image: image-set("https://evil.example/x.png" 1x); color: red; }
      .b { width: expression(alert(1)); }
    `);

    expect(rules).not.toContain("image-set");
    expect(rules).not.toContain("expression");
    expect(rules).toContain("color: red");
  });

  it("gives no CSS where the browser cannot parse a stylesheet", () => {
    vi.stubGlobal("CSSStyleSheet", undefined);

    expect(filterSectionCss(TYPE, ".a { color: red; }")).toBeUndefined();
  });
});
