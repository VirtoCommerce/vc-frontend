import { VcShape } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcShape> = {
  title: "Components/Molecules/VcShape",
  component: VcShape,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcShape v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderShape = (template: string) => (args: Record<string, unknown>) => ({
  components: { VcShape },
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {};

export const Icon: StoryType = {
  args: {
    icon: "adjustments",
  },
};

export const Large: StoryType = {
  args: {
    icon: "adjustments",
    size: "100px",
  },
};

export const Image: StoryType = {
  args: {
    img: "main-banner.webp",
    size: "300px",
  },
};

export const ImageIcon: StoryType = {
  args: {
    img: "main-banner.webp",
    size: "300px",
    icon: "adjustments",
  },
};

export const Mask: StoryType = {
  args: {
    img: "/static/images/home/main-banner.webp",
    size: "300px",
    mask: "academic-cap",
  },
};

export const RatingHalf: StoryType = {
  args: {
    mask: "whishlist",
    size: "100px",
  },
  render: renderShape(`<VcShape v-bind="args">
    <div class="absolute left-0 top-0 bottom-0 w-1/2 bg-primary"></div>
  </VcShape>`),
};

export const RatingQuarter: StoryType = {
  args: {
    mask: "whishlist",
    size: "100px",
  },
  render: renderShape(`<VcShape v-bind="args">
    <div class="absolute left-0 top-0 bottom-0 w-3/12 bg-primary"></div>
  </VcShape>`),
};
