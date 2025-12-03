import { VcProductButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

const meta: Meta<typeof VcProductButton> = {
  title: "Components/Organisms/VcProductButton",
  component: VcProductButton,
  argTypes: {
    size: {
      control: "radio",
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
    template: '<VcProductButton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    buttonText: "Button Text",
    linkText: "Link text",
    linkTo: "/some/link",
  },
};
