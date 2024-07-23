import { defineAsyncComponent } from "vue";
import type { Component } from "vue";

const Category = defineAsyncComponent(() => import("@/shared/catalog/components/category.vue"));
const Slider = defineAsyncComponent(() => import("@/shared/static-content/components/slider.vue"));
const ProductsBlock = defineAsyncComponent(() => import("@/shared/static-content/components/products-block.vue"));

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
        name: "filtersOrientation",
        type: "string",
        defaultValue: "vertical",
        enum: ["vertical", "horizontal"],
        helperText: "Show filters vertically or horizontally",
      },
      {
        name: "filtersDisplayOrder",
        type: "string",
        defaultValue: "",
        helperText:
          'Order of filters in the catalog - comma-separated string of any case. Leave empty to show all filters in default order. Example: "price, brand, category".',
        showIf: "options.get('filtersOrientation') === 'horizontal'",
      },
      {
        friendlyName: "Show rest of filters",
        name: "filtersDisplayOrderShowRest",
        type: "boolean",
        showIf: "options.get('filtersDisplayOrder') !== '' && options.get('filtersOrientation') === 'horizontal'",
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
      {
        name: "keyword",
        type: "string",
      },
      {
        name: "filter",
        type: "string",
        helperText:
          "On your website open Developer Tools(right-click a page and select 'Inspect'). Filter products that needed in the Catalog. Then go to Network -> graphql -> operationName: 'SearchProducts' -> variables -> copy filter",
      },
      {
        name: "countLimitation",
        type: "boolean",
        helperText: "Turn on to set up products count limitation",
        onChange: "options.set('fixedProductsCount', 0)",
      },
      {
        showIf: `options.get('countLimitation') === true`,
        name: "fixedProductsCount",
        type: "number",
        defaultValue: 0,
        onChange: (options: Map<string, number>) => {
          const count = options.get("fixedProductsCount");
          if (typeof count !== "number") {
            return;
          }
          if (count > 20) {
            options.set("fixedProductsCount", 20);
            alert("the maximum number of cards is 20");
          }
        },
      },
      {
        name: "hideTotal",
        type: "boolean",
        showIf: `options.get('countLimitation') === false`,
        helperText: "hidden if Count Limitation is active",
      },
      {
        name: "allowSetMeta",
        type: "boolean",
        defaultValue: false,
        helperText: "Allow the component to set SEO meta tags based on fetched category",
      },
      {
        name: "showButtonToDefaultView",
        type: "boolean",
        defaultValue: false,
        helperText:
          "Toggle this switch to add a button that, when clicked, shows the default category view. Applicable for pages with an URL overlapping the existing category page URL (e.g., /printers).",
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
