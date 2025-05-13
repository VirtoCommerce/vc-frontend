import { VcProductButton } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];

export default {
  title: "Components/Organisms/VcProductButton",
  component: VcProductButton,
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
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
} as Meta<typeof VcProductButton>;

const Template: StoryFn = (args) => ({
  components: { VcProductButton },
  setup: () => ({ args }),
  template: '<VcProductButton v-bind="args" />',
});

export const Basic = Template.bind({});
