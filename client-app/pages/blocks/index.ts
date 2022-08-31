import { Component } from "vue";
import Text from "./text.vue";
import Image from "./image.vue";
import ProductInfo from "./product-info.vue";

const templateBlocks: { [key: string]: Component } = {
  text: Text,
  image: Image,
  "product-info": ProductInfo,
};

export default templateBlocks;
