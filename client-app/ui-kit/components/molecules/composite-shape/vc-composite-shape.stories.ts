import { productImageMocks } from "@/ui-kit/mocks";
import { VcCompositeShape } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const [productImage] = productImageMocks;

const meta: Meta<typeof VcCompositeShape> = {
  title: "Components/Molecules/VcCompositeShape",
  component: VcCompositeShape,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcCompositeShape v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `
          <VcCompositeShape />
        `,
      },
    },
  },
};

export const IconImage: StoryType = {
  args: {
    icon: "academic-cap",
    img: productImage,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcCompositeShape icon="academic-cap" :img="productImage" />
        `,
      },
    },
  },
};

export const Mask: StoryType = {
  args: {
    img: productImage,
    mask: "emoji-happy",
    iconMask: "ai",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcCompositeShape :img="productImage" mask="emoji-happy" icon-mask="ai" />
        `,
      },
    },
  },
};
