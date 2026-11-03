import productTemplateDefault from "@/config/product-default.json";
import productTemplateB2c from "@/config/product_b2c.json";
import type { IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";

/** The section every template of a page type holds: the product, the product listing, the page's content. */
export const MAIN_SECTION_TYPES: Readonly<Record<ThemePageType, string>> = {
  product: "product-info",
  category: "category-listing",
  page: "page-content",
};

/** The templates built into the storefront, by key: what a page shows while the theme has none of its own. */
export const BUILT_IN_TEMPLATES: Readonly<Record<string, IThemePageDocument>> = {
  product: productTemplateDefault as IThemePageDocument,
  "product.b2c": productTemplateB2c as IThemePageDocument,
  category: { settings: {}, content: [{ id: "category-listing", type: MAIN_SECTION_TYPES.category }] },
  page: { settings: {}, content: [{ id: "page-content", type: MAIN_SECTION_TYPES.page }] },
};

/** The id of the main section the storefront adds to a template that lost it. */
export const ADDED_MAIN_SECTION_ID = "__main__";

/** A template without its main section gets it after its other sections, so the product or listing never goes missing. */
export function withMainSection(document: IThemePageDocument, pageType: ThemePageType): IThemePageDocument {
  const mainType = MAIN_SECTION_TYPES[pageType];

  return document.content.some((item) => item.type === mainType)
    ? document
    : { ...document, content: [...document.content, { id: ADDED_MAIN_SECTION_ID, type: mainType }] };
}
