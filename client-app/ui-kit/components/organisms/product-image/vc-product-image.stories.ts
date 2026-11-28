import { productImageMocks } from "@/ui-kit/mocks";
import { VcProductImage } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const [image1, image2, image3, image4, image5] = productImageMocks;

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
    imgSrc: image1,
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
    images: [{ url: image1 }, { url: image2 }, { url: image3 }, { url: image4 }, { url: image5 }],
  },
};
