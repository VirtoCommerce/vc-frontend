import { VcProductImage } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcProductImage",
  component: VcProductImage,
} as Meta<typeof VcProductImage>;

const Template: StoryFn<typeof VcProductImage> = (args) => ({
  components: { VcProductImage },
  setup: () => ({ args }),
  template: '<VcProductImage class="w-32 h-32" v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  imgSrc: "/static/images/product/product-1.webp",
  alt: "Product",
};

export const Lazy = Template.bind({});
Lazy.args = {
  imgSrc: "/static/images/product/product-1.webp",
  alt: "Product",
};

export const NoImage = Template.bind({});
NoImage.args = {
  alt: "Product",
};

export const Carousel = Template.bind({});
Carousel.args = {
  imgSrc: "/static/images/product/product-1.webp",
  alt: "Product",
  images: [
    { id: "1", url: "/static/images/product/product-1.webp", sortOrder: 1 },
    { id: "2", url: "/static/images/product/product-2.webp", sortOrder: 2 },
    { id: "3", url: "/static/images/product/product-3.webp", sortOrder: 3 },
    { id: "4", url: "/static/images/product/product-4.webp", sortOrder: 4 },
    { id: "5", url: "/static/images/product/product-5.webp", sortOrder: 5 },
  ],
};
