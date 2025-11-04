import { VcRating } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const MODES = ["mini", "full"];
const SIZES = ["xs", "sm", "md"];

const meta: Meta<typeof VcRating> = {
  title: "Components/Molecules/VcRating",
  component: VcRating,
  argTypes: {
    mode: {
      control: "inline-radio",
      options: MODES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: MODES.join(" | "),
        },
      },
    },
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcRating v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    value: 4.5,
  },
};

export const Label: StoryType = {
  args: {
    value: 4.5,
    label: "Rating",
  },
};

export const Full: StoryType = {
  args: {
    mode: "full",
  },
};

export const FullReadOnly: StoryType = {
  args: {
    value: 4.5,
    mode: "full",
    readOnly: true,
  },
};

export const FullWithLabel: StoryType = {
  args: {
    mode: "full",
    label: "Rating",
  },
};

export const MiniWithLabel: StoryType = {
  args: {
    mode: "mini",
    label: "Rating",
  },
};

export const MiniReadOnly: StoryType = {
  args: {
    mode: "mini",
    value: 4.5,
    readOnly: true,
  },
};

export const WithReviewCount: StoryType = {
  args: {
    value: 4.5,
    reviewCount: 123,
  },
};

export const WithoutText: StoryType = {
  args: {
    value: 4.5,
    withText: false,
  },
};

export const HalfRating: StoryType = {
  args: {
    value: 4.5,
    mode: "full",
    readOnly: true,
  },
};

export const ZeroRating: StoryType = {
  args: {
    value: 0,
    mode: "full",
    readOnly: true,
  },
};

export const FullRating: StoryType = {
  args: {
    value: 5,
    mode: "full",
    readOnly: true,
  },
};

export const SizeXS: StoryType = {
  args: {
    value: 4.5,
    size: "xs",
  },
};

export const SizeSM: StoryType = {
  args: {
    value: 4.5,
    size: "sm",
  },
};

export const SizeMD: StoryType = {
  args: {
    value: 4.5,
    size: "md",
  },
};

export const CustomMaxValue: StoryType = {
  args: {
    value: 7,
    maxValue: 10,
    mode: "full",
    readOnly: true,
  },
};

export const FullWithReviewCount: StoryType = {
  args: {
    value: 4.5,
    mode: "full",
    reviewCount: 42,
    readOnly: true,
  },
};
