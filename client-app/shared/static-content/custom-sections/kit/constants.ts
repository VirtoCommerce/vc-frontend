/** How `vc-products` shows its products. */
export const PRODUCT_VIEWS = ["grid", "carousel"] as const;

export type ProductViewType = (typeof PRODUCT_VIEWS)[number];
