import { afterEach, describe, expect, it, vi } from "vitest";
import { filterSectionCss } from "./css-filter";
import { MAX_CSS_DEPTH } from "./limits";

const TYPE = "custom-hero";
const ASSETS = "https://cdn.example.com/assets";

function rulesOf(css: string): string {
  return filterSectionCss(TYPE, css, ASSETS)?.rules.replaceAll(/\s+/g, " ") ?? "";
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

  it("moves a {type}__… keyframes out of a condition beside the scope, its condition with it, and drops the others", () => {
    const filtered = filterSectionCss(
      TYPE,
      "@media (prefers-reduced-motion: no-preference) { @supports (rotate: 1turn) { " +
        "@keyframes custom-hero__in { from { opacity: 0; } } @keyframes spin { to { rotate: 1turn; } } } " +
        ".a { animation: 1s custom-hero__in; } } .b { @media (width > 1px) { @keyframes custom-hero__x { } } }",
      ASSETS,
    );
    const keyframes = filtered?.keyframes.replaceAll(/\s+/g, " ") ?? "";

    expect(keyframes).toMatch(
      /^@media \(prefers-reduced-motion: no-preference\) \{ @supports \(rotate: 1turn\) \{ @keyframes custom-hero__in /,
    );
    expect(keyframes).not.toContain("spin");
    expect(keyframes).not.toContain(".a");
    expect(filtered?.rules).toContain("custom-hero__in");
    expect(filtered?.rules).not.toContain("@keyframes");
  });

  it("drops a url() naming any other image from a keyframe, inside a condition too", () => {
    const keyframe = "from { background-image: url(https://evil.example/p.png); opacity: 0; }";
    const filtered = filterSectionCss(
      TYPE,
      `@keyframes custom-hero__a { ${keyframe} } @media all { @keyframes custom-hero__b { ${keyframe} } }`,
      ASSETS,
    );
    const keyframes = filtered?.keyframes.replaceAll(/\s+/g, " ");

    expect(keyframes).toContain("@keyframes custom-hero__a { 0% { opacity: 0; } }");
    expect(keyframes).toContain("@keyframes custom-hero__b { 0% { opacity: 0; } }");
    expect(keyframes).not.toContain("evil.example");
  });

  it("keeps the declarations after a nested rule, and drops a url() naming any other image from them", () => {
    const rules = rulesOf(
      ".a { & .b { color: red; } color: blue; background-image: url(https://evil.example/p.png); }",
    );

    expect(rules).toContain("& .b { color: red; }");
    expect(rules).toContain("color: blue;");
    expect(rules).not.toContain("evil.example");
  });

  it(`keeps rules nested ${MAX_CSS_DEPTH} deep and drops what nests deeper`, () => {
    const nest = (depth: number) => `${"@media all { ".repeat(depth - 1)}.a { color: red; }${" }".repeat(depth - 1)}`;

    expect(rulesOf(nest(MAX_CSS_DEPTH))).toContain("color: red");
    expect(rulesOf(nest(MAX_CSS_DEPTH + 1))).not.toContain("color: red");
    expect(rulesOf(`.a { ${nest(MAX_CSS_DEPTH)} }`)).not.toContain("color: red");
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

  it("keeps outline text: a transparent fill and a stroke in the text's color", () => {
    const outline =
      "color: var(--color-primary-500); -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px currentColor;";

    expect(rulesOf(`.title { ${outline} }`)).toBe(`.title { ${outline} }`);
  });

  it.each([":root", "html", "body .card", ".card, html .x", ":is(body) .y", "*|body .z", "*|html"])(
    "drops a rule naming %s",
    (selector) => {
      expect(rulesOf(`${selector} { color: red; } .kept { margin: 0; }`)).toBe(".kept { margin: 0px; }");
    },
  );

  it("keeps a rule whose pseudo-element takes body as a name, not as an element", () => {
    expect(rulesOf(".card::part(body) { color: red; }")).toBe(".card::part(body) { color: red; }");
  });

  it.each([
    '*:has([data-search-query^="a"]) :scope',
    "div :scope",
    String.raw`div :sc\6fpe`,
    ":scope :scope",
    "div &",
    ".a:not(:scope)",
    ":is(:scope, .x) .y",
    ":scope:has(~ .x)",
    ".a:has(+ .b)",
    ".a:has(> .b, ~ .c)",
    ":scope:nth-child(1 of .promo)",
    ":scope:nth-last-child(2n of .x)",
    ":scope:is(:nth-child(1 of .x))",
    '.a:is(:has([data-search-query^="a"]) *)',
    ".a:not(.b .c)",
    ".a:where(.b > .c)",
    ".a:nth-child(2 of .b .c)",
  ])("drops a rule whose selector can match outside the section: %s", (selector) => {
    expect(rulesOf(`${selector} { color: red; } .kept { margin: 0; }`)).toBe(".kept { margin: 0px; }");
  });

  it("reads the CSS inside the section's scope: a relative selector stays, and a stray brace escapes nothing", () => {
    expect(rulesOf("> .a { color: red; } .b { color: blue; } } .c { color: green; }")).toBe(
      "> .a { color: red; } .b { color: blue; }",
    );
  });

  it("parses the CSS inside a scope rule and reads that rule's children alone", () => {
    const written: string[] = [];
    const inside = new CSSStyleSheet();
    const escaped = new CSSStyleSheet();
    inside.replaceSync(".a { color: red; }");
    escaped.replaceSync(".c { color: green; }");
    class FakeScopeRule {
      cssRules = [...inside.cssRules];

      deleteRule(index: number): void {
        this.cssRules.splice(index, 1);
      }
    }
    vi.stubGlobal("CSSScopeRule", FakeScopeRule);
    vi.stubGlobal(
      "CSSStyleSheet",
      class {
        cssRules = [new FakeScopeRule(), ...escaped.cssRules];

        replaceSync(css: string): void {
          written.push(css);
        }
      },
    );

    expect(filterSectionCss(TYPE, ".a { color: red; } } .c { color: green; }")?.rules).toBe(".a { color: red; }");
    expect(written).toEqual(["@scope ([data-sb-type]) {\n.a { color: red; } } .c { color: green; }\n}"]);
  });

  it("parses the CSS on its own where the browser has no scope rule", () => {
    vi.stubGlobal("CSSScopeRule", undefined);

    expect(rulesOf(".a { color: red; } @keyframes custom-hero__in { from { opacity: 0; } }")).toBe(
      ".a { color: red; }",
    );
    expect(filterSectionCss(TYPE, "@keyframes custom-hero__in { from { opacity: 0; } }")?.keyframes).toContain(
      "custom-hero__in",
    );
  });

  it("drops a nested rule whose selector reaches outside the section", () => {
    expect(rulesOf(".a { color: red; *:has([data-q]) & { color: blue; } }")).not.toContain("blue");
  });

  it.each([
    ":scope",
    ":scope > .a",
    "& .a",
    ":scope:nth-child(2)",
    ":scope:has(> .a .b)",
    ".a:nth-child(2n + 1 of .b)",
    ".a:has(> .b, .c)",
    ".a:is(.b, .c):not(.d)",
    ":dir(rtl) .a",
    ":lang(en, fr) .a",
    '[data-x=":scope"] .a',
  ])("keeps a rule whose selector stays in the section: %s", (selector) => {
    expect(rulesOf(`${selector} { color: red; }`)).toContain("color: red");
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
      .a { background-image: url("${ASSETS}/a.png"); }
      .b { background-image: url("https://cdn.example.com/b.png"); }
      .c { background-image: url("javascript:alert(1)"); }
      .d { --bg: url(data:image/png;base64,AAAA); }
      .e { --bg: url(data:text/html,x); }
    `);

    expect(rules).toContain(`url("${ASSETS}/a.png")`);
    expect(rules).not.toContain("https://cdn.example.com/b.png");
    expect(rules).toContain("url(data:image/png;base64,AAAA)");
    expect(rules).not.toContain("javascript");
    expect(rules).not.toContain("text/html");
  });

  it("keeps an image function naming allowed images, and drops one naming any other", () => {
    const rules = rulesOf(`
      .a { --bg: image-set("${ASSETS}/a.png" 1x, url("${ASSETS}/b.png") 2x); }
      .b { --bg: cross-fade(url("${ASSETS}/a.png"), url("javascript:x")); }
      .c { --bg: src("https://evil.example/x.png"); }
      .d { --bg: image("data:text/html,x"); }
    `);

    expect(rules).toMatch(/^\.a \{ --bg: image-set\(/);
    expect(rules).toContain(`${ASSETS}/b.png`);
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

  it("drops what paints or runs other content: expression(), element() and -moz-element()", () => {
    const rules = rulesOf(`
      .a { --bg: element(#secret); color: red; }
      .b { --bg: -moz-element(#secret); color: red; }
      .c { --w: expression(alert(1)); color: red; }
    `);

    expect(rules).not.toContain("element(");
    expect(rules).not.toContain("expression");
    expect(rules).toContain(".b { color: red; }");
  });

  it("drops behavior and -moz-binding", () => {
    const declarations = filterFakeStyle({ behavior: "url(/x.htc)", "-moz-binding": "url(/x.xml#y)", color: "red" });

    expect(declarations).toEqual({ color: "red" });
  });

  it.each(["background", "-webkit-mask-box-image", "marker"])(
    "drops the whole block when a %s shorthand holding var() names any other image",
    (shorthand) => {
      const declarations = filterFakeStyle(
        { [shorthand]: 'url("https://evil.example/p.png") var(--e,)', [`${shorthand}-source`]: "", color: "red" },
        shorthand,
      );

      expect(declarations).toEqual({});
    },
  );

  it("keeps a shorthand holding var() that names an asset", () => {
    const declarations = filterFakeStyle(
      { background: `var(--a,) url("${ASSETS}/a.png")`, color: "red" },
      "background",
    );

    expect(declarations).toEqual({ background: `var(--a,) url("${ASSETS}/a.png")`, color: "red" });
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
    stubParsedRules([rule]);

    expect(filterSectionCss(TYPE, "@starting-style { .a { opacity: 0; } }")?.rules).toBe(rule.cssText);
  });

  it("drops a keyframes inside @starting-style, which holds no keyframes", () => {
    class FakeStartingStyleRule {
      cssRules: CSSRule[];
      cssText = "@starting-style { }";

      constructor(rules: CSSRule[]) {
        this.cssRules = rules;
      }

      deleteRule(index: number): void {
        this.cssRules.splice(index, 1);
      }
    }
    const inner = new CSSStyleSheet();
    inner.replaceSync("@keyframes custom-hero__in { from { opacity: 0; } } .a { opacity: 0; }");
    const rule = new FakeStartingStyleRule([...inner.cssRules]);
    vi.stubGlobal("CSSStartingStyleRule", FakeStartingStyleRule);
    stubParsedRules([rule]);

    const filtered = filterSectionCss(TYPE, "@starting-style { }");

    expect(rule.cssRules.map((kept) => kept.constructor.name)).toEqual(["CSSStyleRule"]);
    expect(filtered?.keyframes).toBe("");
  });

  it("gives no CSS where the browser cannot parse a stylesheet", () => {
    vi.stubGlobal("CSSStyleSheet", undefined);

    expect(filterSectionCss(TYPE, ".a { color: red; }")).toBeUndefined();
  });
});

/** As the browser holds a shorthand with `var()`: kept as written, unlisted, and its longhands read empty. */
function filterFakeStyle(declarations: Record<string, string>, shorthand?: string): Record<string, string> {
  const listed = Object.keys(declarations).filter((name) => name !== shorthand);
  const style = {
    ...listed,
    length: listed.length,
    get cssText(): string {
      return Object.entries(declarations)
        .map(([name, value]) => `${name}: ${value};`)
        .join(" ");
    },
    set cssText(_: string) {
      Object.keys(declarations).forEach((name) => delete declarations[name]);
    },
    getPropertyValue: (name: string) => declarations[name] ?? "",
    removeProperty: (name: string) => delete declarations[name],
  };
  class FakeStyleRule {
    selectorText = ".a";
    style = style;
    cssRules: CSSRule[] = [];
    cssText = ".a {}";
    deleteRule(): void {}
  }
  vi.stubGlobal("CSSStyleRule", FakeStyleRule);
  stubParsedRules([new FakeStyleRule()]);

  filterSectionCss(TYPE, ".a {}", ASSETS);
  return declarations;
}

/** The browser parses the section's CSS inside a scope rule: the given rules stand in for what it holds. */
function stubParsedRules(rules: object[]): void {
  class FakeScopeRule {
    cssRules = rules;

    deleteRule(index: number): void {
      this.cssRules.splice(index, 1);
    }
  }

  vi.stubGlobal("CSSScopeRule", FakeScopeRule);
  vi.stubGlobal(
    "CSSStyleSheet",
    class {
      cssRules = [new FakeScopeRule()];
      replaceSync(): void {}
    },
  );
}
