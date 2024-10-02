import Assets from "./assets.vue";
import Description from "./description.vue";
import ProductReviews from "./product-reviews.vue";
import Properties from "./properties.vue";
import Variations from "./variations.vue";
import type { Component } from "vue";

const templateBlocks: { [key: string]: Component } = {
  "product-assets": Assets,
  "product-description": Description,
  "product-properties": Properties,
  "product-variations": Variations,
  "product-reviews": ProductReviews,
};

export default templateBlocks;
