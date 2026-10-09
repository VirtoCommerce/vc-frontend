import { VcProductImage } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductImage> = {
  title: "Components/Organisms/VcProductImage",
  component: VcProductImage,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductImage class="w-32 h-32" v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    imgSrc: "product-example-1.webp",
    alt: "Product",
  },
};

export const Lazy: StoryType = {
  args: {
    ...Basic.args,
    lazy: true,
  },
};

export const NoImage: StoryType = {
  args: {
    alt: "Product",
  },
};

export const Carousel: StoryType = {
  args: {
    ...Basic.args,
    images: [
      { id: "1", url: "product-example-1.webp", sortOrder: 1 },
      { id: "2", url: "product-example-2.webp", sortOrder: 2 },
      { id: "3", url: "product-example-3.webp", sortOrder: 3 },
      { id: "4", url: "product-example-4.webp", sortOrder: 4 },
      { id: "5", url: "product-example-5.webp", sortOrder: 5 },
    ],
  },
};
