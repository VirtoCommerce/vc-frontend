import { VcQuantity } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcQuantity",
  component: VcQuantity,
  argTypes: {
    onChange: { action: "quantityChange" },
  },
  args: {
    readonly: false,
    disabled: false,
    error: false,
  },
} as Meta<typeof VcQuantity>;

const Template: StoryFn<typeof VcQuantity> = (args) => ({
  components: { VcQuantity },
  setup: () => ({ args }),
  template: '<VcQuantity v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  modelValue: 5,
  name: "quantity",
  minQuantity: 1,
  maxQuantity: 10,
};

export const Readonly = Template.bind({});
Readonly.args = {
  ...Basic.args,
  readonly: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  disabled: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Basic.args,
  error: true,
};
