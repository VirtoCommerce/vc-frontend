/** The most products `vc-products` shows. */
export const MAX_PRODUCTS = 24;
/** The most elements a product card renders, rounded up from those measured in a browser (at most 96). */
export const PRODUCT_CARD_ELEMENTS = 100;

/** How `vc-products` shows its products. */
export const PRODUCT_VIEWS = ["grid", "carousel"] as const;

export type ProductViewType = (typeof PRODUCT_VIEWS)[number];

/** What `vc-products` shows when its attribute is left out. */
export const DEFAULT_PRODUCTS = 4;
export const DEFAULT_PRODUCT_COLUMNS = 4;
export const DEFAULT_PRODUCT_VIEW: ProductViewType = "grid";

/** Whatever type a tag declares them, these hold an address. */
export const LINK_ATTRIBUTES: ReadonlySet<string> = new Set(["to", "href"]);
/** Whatever type a tag declares it, an image of the asset library, as `src` on an `img`. */
export const IMAGE_ATTRIBUTE = "src";
