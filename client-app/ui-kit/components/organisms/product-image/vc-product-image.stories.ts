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
  imgSrc: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM70C3/1426013445000_1121979.jpg",
  alt: "Product",
};

export const Lazy = Template.bind({});
Lazy.args = {
  imgSrc: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM70C3/1426013445000_1121979.jpg",
  alt: "Product",
};

export const Carousel = Template.bind({});
Carousel.args = {
  imgSrc: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM70C3/1426013445000_1121979.jpg",
  alt: "Product",
  images: [
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426013445000_1121978.jpg" },
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426014314000_IMG_475304.jpg" },
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426014314000_IMG_475305.jpg" },
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426014314000_IMG_475306.jpg" },
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426014314000_IMG_475307.jpg" },
    { url: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/VIM65C1/1426014314000_IMG_475308.jpg" },
  ],
};
