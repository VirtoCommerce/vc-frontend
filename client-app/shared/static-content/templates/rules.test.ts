import { describe, expect, it } from "vitest";
import { BUILT_IN_TEMPLATES, withMainSection } from "./built-in";
import { matchesPath, useTemplateConditions } from "./conditions";
import { chooseTemplate, normalizeTemplateRules } from "./rules";
import type { ITemplateChoiceOptions } from "./rules";
import type { IThemePageDocument } from "@/core/theme-snapshot";

const DOCUMENT: IThemePageDocument = { settings: {}, content: [{ id: "s1", type: "text" }] };

function choose(options: Partial<ITemplateChoiceOptions> & Pick<ITemplateChoiceOptions, "pageType">) {
  return chooseTemplate({
    subject: {},
    rules: undefined,
    templates: BUILT_IN_TEMPLATES,
    getCondition: useTemplateConditions().getTemplateCondition,
    ...options,
  });
}

describe("chooseTemplate", () => {
  it.each([
    ["B2C", "product.b2c", "default-b2c"],
    ["b2c", "product", null],
    ["B2C ", "product", null],
    [undefined, "product", null],
  ])("gives a product whose VirtoFrontend_UI_Layout is %j the %s template", (value, template, ruleId) => {
    const resolution = choose({
      pageType: "product",
      subject: { properties: value === undefined ? [] : [{ name: "VirtoFrontend_UI_Layout", value }] },
    });

    expect(resolution).toMatchObject({ template, ruleId });
  });

  it("takes the first enabled rule whose every condition holds", () => {
    const resolution = choose({
      pageType: "product",
      subject: { productType: "Physical", categoryPaths: [["catalog", "shoes"]] },
      templates: { ...BUILT_IN_TEMPLATES, "product.shoes": DOCUMENT, "product.digital": DOCUMENT },
      rules: {
        version: 2,
        product: [
          { id: "off", template: "product.shoes", when: { inCategory: ["shoes"] }, disabled: true },
          { id: "digital", template: "product.digital", when: { productType: "Digital" } },
          { id: "shoes", template: "product.shoes", when: { inCategory: ["shoes"], productType: "Physical" } },
        ],
      },
    });

    expect(resolution).toMatchObject({ template: "product.shoes", ruleId: "shoes" });
  });

  it("skips a rule naming a missing template and a condition it does not know", () => {
    const resolution = choose({
      pageType: "product",
      subject: {},
      rules: {
        version: 2,
        product: [
          { id: "missing", template: "product.missing" },
          { id: "unknown", template: "product.b2c", when: { "loyalty.tier": "gold" } },
        ],
      },
    });

    expect(resolution).toMatchObject({ template: "product", ruleId: null });
  });

  it("skips a rule whose condition is for another page type", () => {
    const resolution = choose({
      pageType: "product",
      subject: { permalink: "/printers/x1" },
      templates: { ...BUILT_IN_TEMPLATES, "product.any": DOCUMENT },
      rules: { version: 2, product: [{ id: "any", template: "product.any", when: { path: "*" } }] },
    });

    expect(resolution).toMatchObject({ template: "product", ruleId: null });
  });

  it("reads category ids given as a comma-separated string", () => {
    const resolution = choose({
      pageType: "category",
      subject: { categoryId: "sale" },
      templates: { ...BUILT_IN_TEMPLATES, "category.sale": DOCUMENT },
      rules: { version: 2, category: [{ id: "sale", template: "category.sale", when: { inCategory: "shoes, sale" } }] },
    });

    expect(resolution).toMatchObject({ template: "category.sale", ruleId: "sale" });
  });

  it("treats an empty list as no rules, and a missing list as the default rules", () => {
    const subject = { properties: [{ name: "VirtoFrontend_UI_Layout", value: "B2C" }] };

    expect(choose({ pageType: "product", subject, rules: { version: 2, product: [] } })?.template).toBe("product");
    expect(choose({ pageType: "product", subject, rules: { version: 2 } })?.template).toBe("product.b2c");
  });

  it("prefers a content page's own template of its page type", () => {
    const templates = { ...BUILT_IN_TEMPLATES, "page.landing": DOCUMENT, "product.landing": DOCUMENT };

    expect(choose({ pageType: "page", templates, ownTemplate: "page.landing" })?.template).toBe("page.landing");
    expect(choose({ pageType: "page", templates, ownTemplate: "product.landing" })?.template).toBe("page");
  });

  it("matches pages by path, language, source and setting", () => {
    const resolution = choose({
      pageType: "page",
      subject: { permalink: "/Landing/Spring/", language: "de-DE", objectType: "Pages", settings: { theme: "dark" } },
      templates: { ...BUILT_IN_TEMPLATES, "page.landing": DOCUMENT },
      rules: {
        version: 2,
        page: [
          {
            id: "landing",
            template: "page.landing",
            when: { path: "landing/*", language: "de", source: "Pages", setting: { name: "theme", equals: "dark" } },
          },
        ],
      },
    });

    expect(resolution?.template).toBe("page.landing");
  });

  it("checks a category against its own id and outline", () => {
    const rules = {
      version: 2 as const,
      category: [{ id: "sale", template: "category.sale", when: { inCategory: ["sale"] } }],
    };
    const templates = { ...BUILT_IN_TEMPLATES, "category.sale": DOCUMENT };

    expect(choose({ pageType: "category", subject: { categoryId: "sale" }, rules, templates })?.template).toBe(
      "category.sale",
    );
    expect(
      choose({ pageType: "category", subject: { categoryPaths: [["catalog", "sale", "shoes"]] }, rules, templates })
        ?.template,
    ).toBe("category.sale");
    expect(choose({ pageType: "category", subject: { categoryId: "shoes" }, rules, templates })?.template).toBe(
      "category",
    );
  });
});

describe("normalizeTemplateRules", () => {
  it("gives the rules of a version 1 file ids by page type and index", () => {
    const rules = normalizeTemplateRules({ version: 1, product: [{ template: "product.b2c" }, { bad: true }] });

    expect(rules?.product).toEqual([{ template: "product.b2c", id: "product-0" }]);
    expect(rules?.category).toBeUndefined();
  });

  it("is not a rules file when the value is not an object", () => {
    expect(normalizeTemplateRules([])).toBeUndefined();
  });
});

describe("matchesPath", () => {
  it.each([
    ["/landing/*", "/landing/spring", true],
    ["/landing/*", "landing", false],
    ["about", "/About/", true],
    ["/a.b", "/axb", false],
  ])("matches %j against %j: %s", (glob, permalink, expected) => {
    expect(matchesPath(permalink, glob)).toBe(expected);
  });
});

describe("withMainSection", () => {
  it("adds the main section after the others when a template lost it", () => {
    expect(withMainSection(DOCUMENT, "product").content.map((item) => item.type)).toEqual(["text", "product-info"]);
    expect(withMainSection(BUILT_IN_TEMPLATES.product, "product")).toBe(BUILT_IN_TEMPLATES.product);
  });

  it("adds the built-in main section with its blocks, the B2C one to a B2C template", () => {
    const added = withMainSection(DOCUMENT, "product").content[1];
    const addedB2c = withMainSection(DOCUMENT, "product", "product.b2c").content[1];

    expect(added.blocks?.map((block) => block.type)).toContain("product-variations");
    expect(added.variationsLayout).toBe("b2b");
    expect(addedB2c.variationsLayout).toBe("b2c");
  });
});
