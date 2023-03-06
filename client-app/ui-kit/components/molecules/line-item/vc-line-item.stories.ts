import { Meta, StoryFn } from "@storybook/vue3";
import { VcLineItem } from "..";

export default {
  title: "Components/Molecules/VcLineItem",
  component: VcLineItem,
  argTypes: {
    onRemove: { action: "removeButtonClick" },
  },
  args: {
    removable: false,
    disabled: false,
  },
} as Meta<typeof VcLineItem>;

const Template: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem },
  setup: () => ({ args }),
  template: '<VcLineItem v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  item: {
    imageUrl: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/7829d/38DJ66/5ZA21_AS01_sm.jpg",
    name: "The product name",
    productId: "d4a775b8-b35e-4079-b5e1-6f42801f821b",
    product: {
      id: "d4a775b8-b35e-4079-b5e1-6f42801f821b",
      brandName: null,
      slug: "#",
      masterVariation: null,
      minQuantity: 0,
      maxQuantity: 0,
      variations: [],
      properties: [
        {
          name: "BRAND",
          value: "Sony",
          type: "Product",
          hidden: false,
          valueType: "ShortText",
          label: "Brand",
        },
        {
          name: "COLOR",
          value: "Black",
          type: "Variation",
          hidden: false,
          valueType: "ShortText",
          label: "Color",
        },
        {
          name: "FUNCTION",
          value: "Function",
          type: "Product",
          hidden: false,
          valueType: "ShortText",
          label: "Function",
        },
      ],
    },
    listPrice: {
      amount: 200,
      decimalDigits: 2,
      formattedAmount: "$200.00",
      formattedAmountWithoutCurrency: "200.00",
      formattedAmountWithoutPoint: "$200",
      formattedAmountWithoutPointAndCurrency: "200",
    },
    salePrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
    },
    vendor: {
      id: "bc7d18d7-0ae0-4bbd-9e06-7cfb08b7fa7c",
      name: "b2badmin test ltd",
      rating: null,
    },
  },
};

export const Removable = Template.bind({});
Removable.args = {
  ...Basic.args,
  removable: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  removable: true,
  disabled: true,
};

export const NoProduct = Template.bind({});
NoProduct.args = {
  item: {
    imageUrl: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/7829d/38DJ66/5ZA21_AS01_sm.jpg",
    name: "The product name",
    productId: "d4a775b8-b35e-4079-b5e1-6f42801f821b",
    listPrice: {
      amount: 200,
      decimalDigits: 2,
      formattedAmount: "$200.00",
      formattedAmountWithoutCurrency: "200.00",
      formattedAmountWithoutPoint: "$200",
      formattedAmountWithoutPointAndCurrency: "200",
    },
    salePrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
    },
    vendor: {
      id: "bc7d18d7-0ae0-4bbd-9e06-7cfb08b7fa7c",
      name: "b2badmin test ltd",
      rating: null,
    },
  },
  removable: true,
};
