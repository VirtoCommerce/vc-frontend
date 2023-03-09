import { Meta, StoryFn } from "@storybook/vue3";
import { VcProperty } from "..";

export default {
  title: "Components/Atoms/VcProperty",
  component: VcProperty,
} as Meta<typeof VcProperty>;

const Template: StoryFn<typeof VcProperty> = (args) => ({
  components: { VcProperty },
  setup: () => ({ args }),
  template: '<VcProperty v-bind="args">Value</VcProperty>',
});

export const Basic = Template.bind({});
Basic.args = {
  label: "Label",
};
