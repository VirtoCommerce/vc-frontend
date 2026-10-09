import Assets from "./assets.vue";
import Description from "./description.vue";
import Options from "./options.vue";
import Properties from "./properties.vue";
import Variations from "./variations.vue";
import type { Component } from "vue";

const templateBlocks: { [key: string]: Component } = {
  "product-assets": Assets,
  "product-description": Description,
  "product-options": Options,
  "product-properties": Properties,
  "product-variations": Variations,
};

export default templateBlocks;
