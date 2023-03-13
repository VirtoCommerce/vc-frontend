import CallToActionWithImage from "./call-to-action-with-image.vue";
import CallToAction from "./call-to-action.vue";
import DemoProductList from "./demo-product-list.vue";
import Features from "./features.vue";
import ImageBlock from "./image-block.vue";
import ProductInfo from "./product-info.vue";
import ProductsBlock from "./products-block.vue";
import PromoText from "./promo-text.vue";
import SubscribeForm from "./subscribe-form.vue";
import TextBlock from "./text-block.vue";
import TitleBlock from "./title-block.vue";
import type { Component } from "vue";

const templateBlocks: { [key: string]: Component } = {
  "text-block": TextBlock,
  "image-block": ImageBlock,
  "product-info": ProductInfo,
  "call-to-action-with-image": CallToActionWithImage,
  "promo-text": PromoText,
  features: Features,
  "call-to-action": CallToAction,
  "subscribe-form": SubscribeForm,
  products: ProductsBlock,
  "title-block": TitleBlock,
  "demo-product-list": DemoProductList,
};

export default templateBlocks;
