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

const wishlistButton = {
  tooltipText: "Add to wishlist",
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
  wishlistButton,
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard>
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
</VcProductCard>
        `,
      },
    },
  },
};

export const Image: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard>
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
</VcProductCard>
        `,
      },
    },
  },
};

export const ImageVendor: StoryType = {
  render: renderCard(`
    <VcProductCard v-bind="args">
      <VcProductImage v-bind="image" />
      <VcProductTitle v-bind="title">Product title Product title</VcProductTitle>
      <VcProductVendor>Product Vendor</VcProductVendor>
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard>
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard>
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>

  <VcProductProperties>
    <VcProperty label="SKU">{{ product.sku }}</VcProperty>
    <VcProperty label="Brand">{{ product.brand }}</VcProperty>
  </VcProductProperties>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="grid">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="grid">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
</VcProductCard>
        `,
      },
    },
  },
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
        <VcProductActionsButton v-bind="wishlistButton" />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<template>
  <VcProductCard view-mode="grid">
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
    <VcProductVendor>{{ product.vendor }}</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="SKU">{{ product.sku }}</VcProperty>
      <VcProperty label="Brand">{{ product.brand }}</VcProperty>
    </VcProductProperties>

    <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />

    <VcAddToCart
      :is-active="product.availabilityData.isActive"
      :is-available="product.availabilityData.isAvailable"
      :is-buyable="product.availabilityData.isBuyable"
      :is-in-stock="product.availabilityData.isInStock"
      :available-quantity="product.availabilityData.availableQuantity"
    >
      <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">
        {{ product.inStockQuantity }}
      </VcChip>
    </VcAddToCart>

    <VcProductActions with-background direction="vertical">
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" :active="isInCompareList" />
    </VcProductActions>
  </VcProductCard>
</template>
        `,
      },
    },
  },
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
        <VcProductActionsButton v-bind="wishlistButton" />
        <VcProductActionsButton v-bind="actionsButton" />
      </VcProductActions>
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<template>
  <VcProductCard view-mode="list">
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
    <VcProductVendor>{{ product.vendor }}</VcProductVendor>

    <VcProductProperties>
      <VcProperty label="SKU">{{ product.sku }}</VcProperty>
      <VcProperty label="Brand">{{ product.brand }}</VcProperty>
    </VcProductProperties>

    <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />

    <VcAddToCart v-bind="product.availabilityData">
      <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">
        {{ product.inStockQuantity }}
      </VcChip>
    </VcAddToCart>

    <VcProductActions>
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" :active="isInCompareList" />
    </VcProductActions>
  </VcProductCard>
</template>
        `,
      },
    },
  },
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
          <VcProductActionsButton v-bind="wishlistButton" />
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="grid">
  <template #media>
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductActions with-background direction="vertical">
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" :active="isInCompareList" />
    </VcProductActions>
  </template>

  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>

  <VcProductProperties>
    <VcProperty label="SKU">{{ product.sku }}</VcProperty>
    <VcProperty label="Brand">{{ product.brand }}</VcProperty>
  </VcProductProperties>

  <VcAddToCart v-bind="product.availabilityData">
    <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">{{ product.inStockQuantity }}</VcChip>
  </VcAddToCart>

  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
</VcProductCard>
        `,
      },
    },
  },
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
          <VcProductActionsButton v-bind="wishlistButton" />
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <template #media>
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductActions>
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" :active="isInCompareList" />
    </VcProductActions>
  </template>

  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>

  <VcProductProperties>
    <VcProperty label="SKU">{{ product.sku }}</VcProperty>
    <VcProperty label="Brand">{{ product.brand }}</VcProperty>
  </VcProductProperties>

  <VcAddToCart v-bind="product.availabilityData">
    <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">{{ product.inStockQuantity }}</VcChip>
  </VcAddToCart>

  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
};

export const LineItem: StoryType = {
  args: {
    viewMode: "item",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />
        <VcRadioButton value="option1" aria-label="Select product" />
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
  parameters: {
    docs: {
      source: {
        code: `
<template>
  <VcProductCard view-mode="item">
    <template #media>
      <VcProductImage :img-src="item.imgSrc" lazy :alt="item.name" />
      <VcRadioButton v-model="selectedItem" :value="item.id" aria-label="Select product" />
    </template>

    <VcProductTitle :lines-number="3" :to="productUrl">{{ item.name }}</VcProductTitle>

    <VcProductProperties>
      <VcProperty label="SKU">{{ item.sku }}</VcProperty>
      <VcProperty label="Brand">{{ item.brand }}</VcProperty>
      <VcProperty label="Price per item" class="@4xl:hidden">{{ item.price.formattedAmount }}</VcProperty>
    </VcProductProperties>

    <VcAddToCart v-bind="item.availabilityData" hide-button>
      <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">
        {{ item.inStockQuantity }}
      </VcChip>
    </VcAddToCart>

    <VcProductPrice :actual-price="item.price" :list-price="item.listPrice" />

    <VcProductTotal :actual-price="item.extendedPrice" :list-price="item.listPrice" />
  </VcProductCard>
</template>
        `,
      },
    },
  },
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
          <VcProductActionsButton v-bind="wishlistButton" />
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

      <VcQuantityStepper :model-value="1">
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <template #media>
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductActions>
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" />
    </VcProductActions>
  </template>

  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>

  <VcProductProperties>
    <VcProperty label="SKU">{{ product.sku }}</VcProperty>
  </VcProductProperties>

  <VcQuantityStepper v-model="quantity">
    <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">{{ product.inStockQuantity }}</VcChip>
  </VcQuantityStepper>

  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
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
          <VcProductActionsButton v-bind="wishlistButton" />
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

      <VcQuantityStepper :model-value="1">
        <VcChip v-bind="chip1">1230</VcChip>
        <VcChip v-bind="chip2">23</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="grid">
  <template #media>
    <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />

    <VcProductActions with-background direction="vertical">
      <VcProductActionsButton tooltip-text="Add to wishlist" />
      <VcProductActionsButton icon="compare" tooltip-text="Add to compare" />
    </VcProductActions>
  </template>

  <VcProductTitle :lines-number="2" :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>

  <VcProductProperties>
    <VcProperty label="SKU">{{ product.sku }}</VcProperty>
  </VcProductProperties>

  <VcQuantityStepper v-model="quantity">
    <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">{{ product.inStockQuantity }}</VcChip>
  </VcQuantityStepper>

  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
};

export const LineItemQuantityStepper: StoryType = {
  args: {
    viewMode: "item",
  },
  render: renderCard(`
    <VcProductCard v-bind="args">
      <template #media>
        <VcProductImage v-bind="image" />
        <VcRadioButton value="option1" aria-label="Select product" />
      </template>

      <VcProductTitle v-bind="{ ...title, linesNumber: 3 }">Product title Product title</VcProductTitle>

      <VcProductProperties>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Label">Value</VcProperty>
        <VcProperty label="Price per item" class="@4xl:hidden">$1,000</VcProperty>
      </VcProductProperties>

      <VcQuantityStepper :model-value="1">
        <VcChip v-bind="chip1">1230</VcChip>
      </VcQuantityStepper>

      <VcProductPrice v-bind="{ ...price, singleLine: false }" />

      <VcProductTotal v-bind="{ ...price, singleLine: false }" />
    </VcProductCard>
  `),
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="item">
  <template #media>
    <VcProductImage :img-src="item.imgSrc" lazy :alt="item.name" />
    <VcRadioButton v-model="selectedItem" :value="item.id" aria-label="Select product" />
  </template>

  <VcProductTitle :lines-number="3" :to="productUrl">{{ item.name }}</VcProductTitle>

  <VcProductProperties>
    <VcProperty label="SKU">{{ item.sku }}</VcProperty>
    <VcProperty label="Price per item" class="@4xl:hidden">{{ item.price.formattedAmount }}</VcProperty>
  </VcProductProperties>

  <VcQuantityStepper v-model="item.quantity">
    <VcChip color="success" size="sm" rounded variant="outline-dark" icon="cube">{{ item.inStockQuantity }}</VcChip>
  </VcQuantityStepper>

  <VcProductPrice :actual-price="item.price" :list-price="item.listPrice" />
  <VcProductTotal :actual-price="item.extendedPrice" :list-price="item.listPrice" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcAddToCart v-bind="product.availabilityData" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductButton button-text="View product" :to="productUrl" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcAddToCart v-bind="product.availabilityData" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
  <VcAddToCart v-bind="product.availabilityData" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcAddToCart v-bind="product.availabilityData" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcProductButton button-text="View product" :to="productUrl" />
</VcProductCard>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcProductCard view-mode="list">
  <VcProductImage :img-src="product.imgSrc" lazy :alt="product.name" />
  <VcProductTitle :lines-number="2" fix-height :to="productUrl">{{ product.name }}</VcProductTitle>
  <VcProductVendor>{{ product.vendor }}</VcProductVendor>
  <VcProductPrice :actual-price="product.price" :list-price="product.listPrice" single-line />
  <VcProductButton button-text="View product" :to="productUrl" />
</VcProductCard>
        `,
      },
    },
  },
};
