import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useProductTemplate } from "./useProductTemplate";
import type { Product } from "@/core/api/graphql/types";
import type { IThemeSnapshot } from "@/core/theme-snapshot";

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));

function product(overrides: { layout?: string; outlines?: string[][] } = {}): Product {
  return {
    id: "p1",
    productType: "Physical",
    outlines: (overrides.outlines ?? [["catalog", "printers"]]).map((ids) => ({ items: ids.map((id) => ({ id })) })),
    properties: overrides.layout ? [{ name: "VirtoFrontend_UI_Layout", value: overrides.layout }] : [],
  } as unknown as Product;
}

function publish(snapshot: Partial<IThemeSnapshot>): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...snapshot },
  });
}

const types = (items: { type: string }[]) => items.map((item) => item.type);

describe("useProductTemplate", () => {
  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
  });

  it("renders a B2B product in the built-in template, as before", () => {
    const { resolution, parts, isB2cLayout } = useProductTemplate(product());

    expect(resolution.value?.template).toBe("product");
    expect(parts.value.main?.type).toBe("product-info");
    expect(types(parts.value.column)).toEqual(["product-reviews"]);
    expect(types(parts.value.after)).toEqual(["related-products", "recommended-products"]);
    expect(isB2cLayout.value).toBe(false);
  });

  it("gives a product marked B2C the B2C template and its variations", () => {
    const { resolution, isB2cLayout, variationsLayout } = useProductTemplate(product({ layout: "B2C" }));

    expect(resolution.value).toMatchObject({ template: "product.b2c", ruleId: "default-b2c" });
    expect(isB2cLayout.value).toBe(true);
    expect(variationsLayout.value).toBe("B2C");
  });

  it("does not load B2C variations in a B2B template", () => {
    publish({
      rules: { version: 2, product: [] },
      templates: { product: { settings: {}, content: [{ id: "info", type: "product-info" }] } },
    });

    const { isB2cLayout, variationsLayout } = useProductTemplate(product({ layout: "B2C" }));

    expect(isB2cLayout.value).toBe(false);
    expect(variationsLayout.value).toBe("B2B");
  });

  it("chooses by any of the product's outlines, whatever the path it was reached by", () => {
    publish({
      rules: { version: 2, product: [{ id: "toner", template: "product.toner", when: { inCategory: ["toner"] } }] },
      templates: {
        "product.toner": {
          settings: {},
          content: [
            { id: "promo", type: "text-block" },
            { id: "info", type: "product-info", variationsLayout: "b2c" },
          ],
        },
      },
    });

    const { resolution, parts, isB2cLayout } = useProductTemplate(
      product({
        outlines: [
          ["catalog", "printers"],
          ["catalog", "supplies", "toner"],
        ],
      }),
    );

    expect(resolution.value).toMatchObject({ template: "product.toner", ruleId: "toner" });
    expect(types(parts.value.before)).toEqual(["text-block"]);
    expect(isB2cLayout.value).toBe(true);
  });

  it("adds the product info to a template that lost it", () => {
    publish({ templates: { product: { settings: {}, content: [{ id: "promo", type: "text-block" }] } } });

    const { parts } = useProductTemplate(product());

    expect(parts.value.main?.type).toBe("product-info");
    expect(types(parts.value.before)).toEqual(["text-block"]);
  });

  it("chooses nothing until the product is there", () => {
    expect(useProductTemplate(undefined).template.value).toBeUndefined();
  });
});
