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
    imageUrl: null,
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
    quantity: 1,
    sku: "XZH-79259286",
    thumbnailImageUrl: null,
    validationErrors: [],
    extendedPrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
      currency: {
        code: "USD",
        customFormatting: null,
        exchangeRate: 1,
        symbol: "$",
      },
    },
    placedPrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
      currency: {
        code: "USD",
        customFormatting: null,
        exchangeRate: 1,
        symbol: "$",
      },
    },
    listPrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
      currency: {
        code: "USD",
        customFormatting: null,
        exchangeRate: 1,
        symbol: "$",
      },
    },
    salePrice: {
      amount: 100,
      decimalDigits: 2,
      formattedAmount: "$100.00",
      formattedAmountWithoutCurrency: "100.00",
      formattedAmountWithoutPoint: "$100",
      formattedAmountWithoutPointAndCurrency: "100",
      currency: {
        code: "USD",
        customFormatting: null,
        exchangeRate: 1,
        symbol: "$",
      },
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
