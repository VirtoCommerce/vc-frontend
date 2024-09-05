import { VcDialog } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcDialog",
  component: VcDialog,
  args: {
    error: false,
    counter: false,
    showEmpty: false,
    singleLine: false,
  },
} as Meta<typeof VcDialog>;

const Template: StoryFn<typeof VcDialog> = (args) => ({
  components: { VcDialog },
  setup: () => ({ args }),
  template: '<VcDialog v-bind="args" />',
});

export const Basic = Template.bind({});
