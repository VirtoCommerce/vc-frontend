import { Component } from "vue";
import Description from "./description.vue";
import Properties from "./properties.vue";
import Variations from "./variations.vue";

const templateBlocks: { [key: string]: Component } = {
  "product-description": Description,
  "product-properties": Properties,
  "product-variations": Variations,
};

export default templateBlocks;
