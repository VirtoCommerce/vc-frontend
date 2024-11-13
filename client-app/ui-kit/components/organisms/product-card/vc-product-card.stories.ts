import { getMoney } from "@/ui-kit/mocks";
import { VcProductCard, VcProductImage, VcAddToCart } from "..";
import { VcProductVendor, VcProductProperties, VcProductTitle, VcProductActions, VcRadioButton } from "../../atoms";
import { VcChip, VcProductPrice, VcProductActionsButton } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

const VIEW_MODES = ["grid", "list", "item"];

export default {
  title: "Components/Organisms/VcProductCard",
  component: VcProductCard,
  argTypes: {
    viewMode: {
      control: "radio",
      options: VIEW_MODES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VIEW_MODES.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcProductCard>;

const image = {
  imgSrc: "https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg",
  lazy: true,
  alt: "Product image",
};

const title = {
  linesNumber: 2,
  to: "#",
};

const price = {
  actualPrice: getMoney(1300000),
  listPrice: getMoney(1520000),
  singleLine: true,
};

const chip1 = {
  color: "success",
  size: "xs",
  rounded: true,
  variant: "outline-dark",
};

const chip2 = {
  color: "secondary",
  size: "xs",
  rounded: true,
  variant: "outline-dark",
};

const availabilityData = {
  isActive: true,
  isAvailable: true,
  isBuyable: true,
  isInStock: true,
  availableQuantity: 999999,
};

const actions = {
  withBackground: true,
  direction: "vertical",
};

const actionsButton = {
  icon: "compare",
  tooltipText: "Add to compare",
  active: true,
};

const BasicTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard },
  setup: () => ({ args, title }),
  template: `<VcProductCard v-bind="args">
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
  </VcProductCard>`,
});

export const Basic = BasicTemplate.bind({});

const ImageTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage },
  setup: () => ({ args, title, image }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
  </VcProductCard>`,
});

export const Image = ImageTemplate.bind({});

const ImageVendorTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcProductVendor },
  setup: () => ({ args, title, image }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductVendor>Product Vendor</VcProductVendor>
  </VcProductCard>`,
});

export const ImageVendor = ImageVendorTemplate.bind({});

const ImageVendorPropertiesTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcProductVendor, VcProductProperties },
  setup: () => ({ args, title, image }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductVendor>Product Vendor</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
    </VcProductProperties>
  </VcProductCard>`,
});

export const ImageVendorProperties = ImageVendorPropertiesTemplate.bind({});

const ImagePriceTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcProductTitle, VcProductPrice, VcProductVendor },
  setup: () => ({ args, title, price, image }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductPrice v-bind="{ ...price, singleLine: false }" />
  </VcProductCard>`,
});

export const ImagePriceCard = ImagePriceTemplate.bind({});
ImagePriceCard.args = {
  viewMode: "grid",
};

export const ImagePriceList = ImagePriceTemplate.bind({});
ImagePriceList.args = {
  viewMode: "list",
};

const ImageVendorPriceTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcProductTitle, VcProductPrice, VcProductVendor },
  setup: () => ({ args, title, price, image }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductPrice v-bind="price" />
    <VcProductVendor>Product Vendor</VcProductVendor>
  </VcProductCard>`,
});

export const ImageVendorPriceCard = ImageVendorPriceTemplate.bind({});
ImageVendorPriceCard.args = {
  viewMode: "grid",
};

export const ImageVendorPriceList = ImageVendorPriceTemplate.bind({});
ImageVendorPriceList.args = {
  viewMode: "list",
};

const FullTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: {
    VcProductCard,
    VcProductActions,
    VcProductActionsButton,
    VcProductImage,
    VcProductTitle,
    VcProductVendor,
    VcProductProperties,
    VcAddToCart,
    VcChip,
  },
  setup: () => ({ args, title, price, chip1, chip2, image, availabilityData, actions, actionsButton }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="image" />

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductVendor>Product Vendor</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
    </VcProductProperties>

    <VcProductPrice v-bind="price" />

    <VcAddToCart v-bind="availabilityData">
      <VcChip v-bind="chip1">1230 in Stock</VcChip>
      <VcChip v-bind="chip2">23 in Cart</VcChip>
    </VcAddToCart>

    <VcProductActions v-bind="args.viewMode === 'grid' ? actions : {}">
      <VcProductActionsButton />
      <VcProductActionsButton v-bind="actionsButton" />
    </VcProductActions>
  </VcProductCard>`,
});

export const FullCard = FullTemplate.bind({});
FullCard.args = {
  viewMode: "grid",
};

export const FullList = FullTemplate.bind({});
FullList.args = {
  viewMode: "list",
};

const FullGridTemplateRecommended: StoryFn<typeof VcProductCard> = (args) => ({
  components: {
    VcProductCard,
    VcProductActions,
    VcProductActionsButton,
    VcProductImage,
    VcProductTitle,
    VcProductVendor,
    VcProductProperties,
    VcAddToCart,
    VcChip,
  },
  setup: () => ({ args, title, price, chip1, chip2, image, availabilityData, actions, actionsButton }),
  template: `<VcProductCard v-bind="args">
    <template #media>
      <VcProductImage v-bind="image" />

      <VcProductActions v-bind="actions">
        <VcProductActionsButton />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </template>

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>

    <VcProductVendor>Product Vendor</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
    </VcProductProperties>

    <VcAddToCart v-bind="availabilityData">
      <VcChip v-bind="chip1">1230 in Stock</VcChip>
      <VcChip v-bind="chip2">23 in Cart</VcChip>
    </VcAddToCart>

    <VcProductPrice v-bind="price" />
  </VcProductCard>`,
});

export const FullCardRecommendedWay = FullGridTemplateRecommended.bind({});
FullCardRecommendedWay.args = {
  viewMode: "grid",
};

const FullListTemplateRecommended: StoryFn<typeof VcProductCard> = (args) => ({
  components: {
    VcProductCard,
    VcProductActions,
    VcProductActionsButton,
    VcProductImage,
    VcProductTitle,
    VcProductVendor,
    VcProductProperties,
    VcAddToCart,
    VcChip,
  },
  setup: () => ({ args, title, price, chip1, chip2, image, availabilityData, actions, actionsButton }),
  template: `<VcProductCard v-bind="args">
    <template #media>
      <VcProductImage v-bind="image" />

      <VcProductActions>
        <VcProductActionsButton />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </template>

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>

    <VcProductVendor>Product Vendor</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
    </VcProductProperties>

    <VcAddToCart v-bind="availabilityData">
      <VcChip v-bind="chip1">1230 in Stock</VcChip>
      <VcChip v-bind="chip2">23 in Cart</VcChip>
    </VcAddToCart>

    <VcProductPrice v-bind="{ ...price, singleLine: false }" />
  </VcProductCard>`,
});

export const FullListRecommendedWay = FullListTemplateRecommended.bind({});
FullListRecommendedWay.args = {
  viewMode: "list",
};

const LineItemTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: {
    VcProductCard,
    VcProductActions,
    VcProductActionsButton,
    VcProductImage,
    VcProductTitle,
    VcProductVendor,
    VcProductProperties,
    VcAddToCart,
    VcChip,
    VcRadioButton,
  },
  setup: () => ({ args, title, price, chip1, chip2, image, availabilityData, actions, actionsButton }),
  template: `<VcProductCard v-bind="args">
    <template #media>
      <VcProductImage v-bind="image" />
      <VcRadioButton />
    </template>

    <VcProductTitle v-bind="{ ...title, linesNumber: 3}">Product title Product title</VcProductTitle>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Price per item" class="@4xl:hidden">$1,000</VcProperty>
    </VcProductProperties>

    <VcAddToCart v-bind="{availabilityData, hideButton: true}">
      <VcChip v-bind="chip1">1230 in Stock</VcChip>
    </VcAddToCart>

    <VcProductPrice v-bind="{ ...price, singleLine: false }" />

    <VcProductTotal v-bind="{ ...price, singleLine: false }" />
  </VcProductCard>`,
});

export const LineItem = LineItemTemplate.bind({});
LineItem.args = {
  viewMode: "item",
};
