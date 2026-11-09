import productTemplateDefault from "@/config/product-default.json";
import productTemplateB2c from "@/config/product_b2c.json";
import type { IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";

export const MAIN_SECTION_TYPES: Readonly<Record<ThemePageType, string>> = {
  product: "product-info",
  category: "category-listing",
  page: "page-content",
};

export const BUILT_IN_TEMPLATES: Readonly<Record<string, IThemePageDocument>> = {
  product: productTemplateDefault as IThemePageDocument,
  "product.b2c": productTemplateB2c as IThemePageDocument,
  category: { settings: {}, content: [{ id: "category-listing", type: MAIN_SECTION_TYPES.category }] },
  page: { settings: {}, content: [{ id: "page-content", type: MAIN_SECTION_TYPES.page }] },
};

export const ADDED_MAIN_SECTION_ID = "__main__";

/** A template that lost its main section gets the built-in one, so the product or listing never goes missing. */
export function withMainSection(
  document: IThemePageDocument,
  pageType: ThemePageType,
  templateKey: string = pageType,
): IThemePageDocument {
  const mainType = MAIN_SECTION_TYPES[pageType];

  if (document.content.some((item) => item.type === mainType)) {
    return document;
  }

  const builtIn = Object.hasOwn(BUILT_IN_TEMPLATES, templateKey)
    ? BUILT_IN_TEMPLATES[templateKey]
    : BUILT_IN_TEMPLATES[pageType];
  const main = builtIn.content.find((item) => item.type === mainType);

  return { ...document, content: [...document.content, { ...main, id: ADDED_MAIN_SECTION_ID, type: mainType }] };
}
