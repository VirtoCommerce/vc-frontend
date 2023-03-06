import { Meta, StoryFn } from "@storybook/vue3";
import { VcProperty } from "..";

export default {
  title: "Components/Atoms/VcProperty",
  component: VcProperty,
  args: {
    noProduct: false,
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

export const NoProduct = Template.bind({});
NoProduct.args = {
  ...Basic.args,
  noProduct: true,
};
