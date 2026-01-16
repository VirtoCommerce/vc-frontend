import { getMoney } from "@/ui-kit/mocks";
import { VcProductCard } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VIEW_MODES = ["grid", "list", "item"];

const meta: Meta<typeof VcProductCard> = {
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
    background: {
      control: "boolean",
      type: { name: "boolean", required: false },
    },
    border: {
      control: "boolean",
      type: { name: "boolean", required: false },
    },
  },
  render: (args) => ({
    setup: () => ({ args, title }),
    template: `<VcProductCard v-bind="args">
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    </VcProductCard>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

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
  size: "sm",
  rounded: true,
  variant: "outline-dark",
  icon: "cube",
};

const chip2 = {
  color: "secondary",
  size: "sm",
  rounded: true,
  variant: "outline-dark",
  icon: "cart",
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

const commonData = {
  title,
  price,
  chip1,
  chip2,
  image,
  availabilityData,
  actions,
  actionsButton,
};

// Общая render функция для избежания дублирования
const renderCard =
  (template: string, additionalData = {}) =>
  (args: Record<string, unknown>) => ({
    setup: () => ({ args, ...commonData, ...additionalData }),
    template,
  });

export const Basic: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    </VcProductCard>
  `),
};

export const Image: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    </VcProductCard>
  `),
};

export const ImageVendor: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
    </VcProductCard>
  `),
};

export const ImageVendorProperties: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>

      <VcProductProperties>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
      </VcProductProperties>
    </VcProductCard>
  `),
};

export const ImagePriceCard: StoryType = {
  args: {
    viewMode: "grid",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const ImagePriceList: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const ImageVendorPriceCard: StoryType = {
  args: {
    viewMode: "grid",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="price" />
      <VcProductVendor>Product Vendor</VcProductVendor>
    </VcProductCard>
  `),
};

export const ImageVendorPriceList: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="price" />
      <VcProductVendor>Product Vendor</VcProductVendor>
    </VcProductCard>
  `),
};

export const FullCard: StoryType = {
  args: {
    viewMode: "grid",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
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
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcAddToCart>

      <VcProductActions v-bind="args.viewMode === 'grid' ? actions : {}">
        <VcProductActionsButton />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </VcProductCard>
  `),
};

export const FullList: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
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
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcAddToCart>

      <VcProductActions v-bind="args.viewMode === 'grid' ? actions : {}">
        <VcProductActionsButton />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </VcProductCard>
  `),
};

export const FullCardRecommendedWay: StoryType = {
  args: {
    viewMode: "grid",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
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
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcAddToCart>

      <VcProductPrice v-bind="price" />
    </VcProductCard>
  `),
};

export const FullListRecommendedWay: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
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
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcAddToCart>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const LineItem: StoryType = {
  args: {
    viewMode: "item",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />
        <VcRadioButton value="option1" />
      </template>

      <VcProductTitle v-bind="{ ...title, linesNumber: 3}">Product title Product title</VcProductTitle>

      <VcProductProperties>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Price per item" class="@4xl:hidden">$1,000</VcProperty>
      </VcProductProperties>

      <VcAddToCart v-bind="{availabilityData, hideButton: true}">
        <VcChip v-bind="chip1">1230</VcChip>
      </VcAddToCart>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />

      <VcProductTotal v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const FullListQuantityStepper: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />

        <VcProductActions v-bind="args.viewMode === 'grid' ? actions : {}">
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

      <VcQuantityStepper>
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const FullGridQuantityStepper: StoryType = {
  args: {
    viewMode: "grid",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />

        <VcProductActions v-bind="args.viewMode === 'grid' ? actions : {}">
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

      <VcQuantityStepper>
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

export const LineItemQuantityStepper: StoryType = {
  args: {
    viewMode: "item",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />
        <VcRadioButton value="option1" />
      </template>

      <VcProductTitle v-bind="{ ...title, linesNumber: 3 }">Product title Product title</VcProductTitle>

      <VcProductProperties>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Price per item" class="@4xl:hidden">$1,000</VcProperty>
      </VcProductProperties>

      <VcQuantityStepper v-bind="{ value: 0 }">
        <VcChip v-bind="chip1">1230</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />

      <VcProductTotal v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
};

// ===== List View Stories =====

const listTitle = { ...title, fixHeight: true };

export const ListTitleOnly: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListImageTitle: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleVendor: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitlePrice: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="price" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleAddToCart: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcAddToCart v-bind="availabilityData" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleProductButton: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductButton buttonText="View product" to="#" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleProductButtons: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductButton buttonText="View product" to="#" />
      <VcProductButton buttonText="Configure" to="#" variant="solid" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleVendorPrice: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
      <VcProductPrice v-bind="price" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitlePriceAddToCart: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="price" />
      <VcAddToCart v-bind="availabilityData" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleVendorAddToCart: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
      <VcAddToCart v-bind="availabilityData" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleVendorPriceAddToCart: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
      <VcProductPrice v-bind="price" />
      <VcAddToCart v-bind="availabilityData" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitlePriceProductButton: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductPrice v-bind="price" />
      <VcProductButton buttonText="View product" to="#" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};

export const ListTitleVendorPriceProductButton: StoryType = {
  args: {
    viewMode: "list",
  },
  render: renderCard(
    `
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="listTitle">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
      <VcProductPrice v-bind="price" />
      <VcProductButton buttonText="View product" to="#" />
    </VcProductCard>
  `,
    { listTitle },
  ),
};
