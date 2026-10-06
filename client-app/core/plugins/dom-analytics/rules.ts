import type { ObjectSourceType, RuleType } from "./types";

// Required: a card outside a `product-list` container sends nothing, so blocks that still call
// `analytics()` by hand don't get a second event
const LIST_PROPERTIES: ObjectSourceType = {
  source: "object",
  from: "product-list",
  fields: {
    item_list_id: { attr: "listId" },
    item_list_name: { attr: "listName" },
    related_id: { attr: "relatedId" },
    related_type: { attr: "relatedType" },
  },
};

// Markup without a `v-track-item` object behind it (Builder.io HTML, custom themes)
const PRODUCT_FROM_ATTRS: ObjectSourceType = {
  source: "object",
  fields: {
    id: { attr: "productId" },
    code: { attr: "productSku" },
    name: { attr: "productName" },
    "price.actual.amount": { attr: "productPrice", type: "number" },
  },
};

export const rules: RuleType[] = [
  {
    event: "selectItem",
    trigger: "click",
    target: "product-link",
    args: [{ source: "item", from: "product-card", fallback: PRODUCT_FROM_ATTRS }, LIST_PROPERTIES],
  },
  {
    event: "viewItemList",
    trigger: "appear",
    target: "product-list",
    args: [{ source: "collect", target: "product-card", fallback: PRODUCT_FROM_ATTRS }, LIST_PROPERTIES],
  },
  {
    event: "viewItem",
    trigger: "appear",
    target: "product-details",
    args: [{ source: "item" }],
  },
];
