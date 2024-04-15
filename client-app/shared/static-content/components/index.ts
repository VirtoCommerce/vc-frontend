import CallToActionWithImage from "./call-to-action-with-image.vue";
import CallToAction from "./call-to-action.vue";
import DemoProductList from "./demo-product-list.vue";
import Features from "./features.vue";
import ImageBlock from "./image-block.vue";
import Login from "./login.vue";
import ProductInfo from "./product-info.vue";
import ProductsBlock from "./products-block.vue";
import PromoText from "./promo-text.vue";
import RelatedProducts from "./related-products.vue";
import Slider from "./slider.vue";
import SubscribeForm from "./subscribe-form.vue";
import TextBlock from "./text-block.vue";
import TitleBlock from "./title-block.vue";
import type { Component } from "vue";

export const builderIOComponents: Array<BuilderIOComponentType> = [
  {
    name: "Products",
    component: ProductsBlock,
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Products Block",
      },
      {
        name: "query",
        type: "string",
      },
    ],
  },
];

type BuilderIOComponentType = {
  component: Component;
  inputs: Array<object>;
  name: string;
};
export const templateBlocks: { [key: string]: Component } = {
  "call-to-action-with-image": CallToActionWithImage,
  "call-to-action": CallToAction,
  "demo-product-list": DemoProductList,
  features: Features,
  "image-block": ImageBlock,
  login: Login,
  "product-info": ProductInfo,
  products: ProductsBlock,
  "promo-text": PromoText,
  slider: Slider,
  "related-products": RelatedProducts,
  "subscribe-form": SubscribeForm,
  "text-block": TextBlock,
  "title-block": TitleBlock,
};
