import { getMoney } from "@/ui-kit/mocks";
import { VcProductCard, VcProductImage, VcAddToCart } from "..";
import { VcChip } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcProductCard",
  component: VcProductCard,
  argTypes: {},
} as Meta<typeof VcProductCard>;

const title = {
  linesNumber: 2,
  to: "somelink.com",
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
  setup: () => ({ args, title }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage v-bind="{imgSrc: 'https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg'}" />

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
  </VcProductCard>`,
});

export const Image = ImageTemplate.bind({});

const ImageVendorTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcAddToCart, VcChip },
  setup: () => ({ args, title }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage img-src="https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg" />
    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductVendor>Product Vendor</VcProductVendor>
  </VcProductCard>`,
});

export const ImageVendor = ImageVendorTemplate.bind({});

const ImageVendorPropertiesTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcAddToCart, VcChip },
  setup: () => ({ args, title }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage img-src="https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg" />
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

const ImageVendorPriceTemplate: StoryFn<typeof VcProductCard> = (args) => ({
  components: { VcProductCard, VcProductImage, VcAddToCart, VcChip },
  setup: () => ({ args, title, price }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage img-src="https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg" />
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
  components: { VcProductCard, VcProductImage, VcAddToCart, VcChip },
  setup: () => ({ args, title, price, chip1, chip2 }),
  template: `<VcProductCard v-bind="args">
    <VcProductImage img-src="https://vcst-dev.govirto.com/cms-content/assets/catalog/SAUN65JS9500/1426804677000_1122018.jpg" />

    <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    <VcProductVendor>Product Vendor</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
      <VcProperty label="Label">Value</VcProperty>
    </VcProductProperties>

    <VcProductPrice v-bind="price" />

    <VcAddToCart>
      <VcChip v-bind="chip1">1230 in Stock</VcChip>
      <VcChip v-bind="chip2">23 in Cart</VcChip>
    </VcAddToCart>
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
