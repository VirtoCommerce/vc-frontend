import { Meta, StoryFn } from "@storybook/vue3";
import { VcProperty } from "..";

export default {
  title: "Components/Atoms/VcProperty",
  component: VcProperty,
  args: {
    removed: false,
  },
} as Meta<typeof VcProperty>;

const Template: StoryFn<typeof VcProperty> = (args) => ({
  components: { VcProperty },
  setup: () => ({ args }),
  template: '<VcProperty v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  label: "Type",
  value: "Blank with Shoulder",
};

export const Removed = Template.bind({});
Removed.args = {
  ...Basic.args,
  removed: true,
};
