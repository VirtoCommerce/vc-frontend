import { Component } from "vue";
import Text from "./text.vue";
import Image from "./image.vue";
import ProductInfo from "./product-info.vue";
import CallToActionWithImage from "./call-to-action-with-image.vue";
import PromoText from "./promo-text.vue";
import Features from "./features.vue";
import CallToAction from "./call-to-action.vue";
import SubscribeForm from "./subscribe-form.vue";
import ProductsBlock from "./products-block.vue";

const templateBlocks: { [key: string]: Component } = {
  text: Text,
  image: Image,
  "product-info": ProductInfo,
  "call-to-action-with-image": CallToActionWithImage,
  "promo-text": PromoText,
  features: Features,
  "call-to-action": CallToAction,
  "subscribe-form": SubscribeForm,
  products: ProductsBlock,
};

export default templateBlocks;
