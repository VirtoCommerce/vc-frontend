import { VcProductImage } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcProductImage",
  component: VcProductImage,
} as Meta<typeof VcProductImage>;

const Template: StoryFn = (args) => ({
  components: { VcProductImage },
  setup: () => ({ args }),
  template: '<VcProductImage class="w-32 h-32" v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  imgSrc: "product-example-1.webp",
  alt: "Product",
};

export const Lazy = Template.bind({});
Lazy.args = {
  imgSrc: "product-example-1.webp",
  alt: "Product",
};

export const NoImage = Template.bind({});
NoImage.args = {
  alt: "Product",
};

export const Carousel = Template.bind({});
Carousel.args = {
  imgSrc: "product-example-1.webp",
  alt: "Product",
  images: [
    { id: "1", url: "product-example-1.webp", sortOrder: 1 },
    { id: "2", url: "product-example-2.webp", sortOrder: 2 },
    { id: "3", url: "product-example-3.webp", sortOrder: 3 },
    { id: "4", url: "product-example-4.webp", sortOrder: 4 },
    { id: "5", url: "product-example-5.webp", sortOrder: 5 },
  ],
};
