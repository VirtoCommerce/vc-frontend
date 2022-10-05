import { Component } from "vue";
import TextBlock from "./text-block.vue";
import ImageBlock from "./image-block.vue";
import ProductInfo from "./product-info.vue";
import SideImage from "./side-image.vue";
import PromoText from "./promo-text.vue";
import ColumnImages from "./column-images.vue";
import DarkPromoText from "./dark-promo-text.vue";
import SubscribeForm from "./subscribe-form.vue";
import ProductsBlock from "./products-block.vue";

const templateBlocks: { [key: string]: Component } = {
  "text-block": TextBlock,
  "image-block": ImageBlock,
  "product-info": ProductInfo,
  "side-image": SideImage,
  "promo-text": PromoText,
  "column-images": ColumnImages,
  "dark-promo-text": DarkPromoText,
  "subscribe-form": SubscribeForm,
  products: ProductsBlock,
};

export default templateBlocks;
