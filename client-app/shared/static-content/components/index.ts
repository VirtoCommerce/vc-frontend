import { Category } from "@/shared/catalog";
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
    name: "Category",
    component: Category,
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Custom Category",
      },
      {
        name: "hideTotal",
        type: "boolean",
      },
      {
        name: "hideBreadcrumbs",
        type: "boolean",
      },
      {
        name: "hideSidebar",
        type: "boolean",
      },
      {
        name: "hideControls",
        type: "boolean",
      },
      {
        name: "hideSorting",
        type: "boolean",
      },
      {
        name: "viewMode",
        type: "string",
        defaultValue: "<unset>",
        enum: ["<unset>", "grid", "list"],
        helperText: "Fixing the View Mode",
        showIf: `options.get('hideViewModeSelector') === false`,
      },
      {
        name: "cardType",
        type: "string",
        defaultValue: "full",
        helperText: "Card type for grid view mode",
        enum: ["full", "short"],
      },
      {
        name: "columnsAmountTablet",
        type: "string",
        defaultValue: "3",
        enum: ["3", "2"],
      },
      {
        name: "columnsAmountDesktop",
        type: "string",
        defaultValue: "4",
        enum: ["4", "3"],
      },
    ],
  },
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
        name: "cardType",
        type: "string",
        defaultValue: "full",
        enum: ["full", "short"],
      },
      {
        name: "count",
        type: "number",
        defaultValue: 4,
        friendlyName: "Cards amount",
        onChange: (options: Map<string, number>) => {
          const count = options.get("count");
          if (typeof count !== "number") {
            return;
          }
          if (count > 12) {
            options.set("count", 12);
            alert("the maximum number of cards is 12");
          }
        },
      },
      {
        name: "columnsAmountTablet",
        type: "string",
        defaultValue: "3",
        enum: ["3", "2"],
      },
      {
        name: "columnsAmountDesktop",
        type: "string",
        defaultValue: "4",
        enum: ["4", "3"],
      },
      {
        name: "query",
        friendlyName: "Keyword",
        type: "string",
      },
      {
        name: "filter",
        type: "string",
        helperText:
          "On your website open Developer Tools(right-click a page and select 'Inspect'). Filter products that needed in the Catalog. Then go to Network -> graphql -> operationName: 'SearchProducts' -> variables -> copy filter",
      },
    ],
  },
  {
    component: Slider,
    name: "Slider",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Slider",
      },
      {
        name: "subtitle",
        type: "string",
        defaultValue: "Subtitle",
      },
      {
        name: "height",
        type: "string",
        defaultValue: "auto",
        enum: ["small", "medium", "large", "auto"],
      },
      {
        name: "slides",
        type: "list",
        subFields: [
          {
            id: "image",
            name: "image",
            type: "file",
            allowedFileTypes: ["jpeg", "jpg", "png", "svg"],
          },
          {
            name: "title",
            id: "title",
            label: "Title",
            type: "string",
          },
          {
            name: "text",
            id: "text",
            type: "string",
          },
        ],
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
