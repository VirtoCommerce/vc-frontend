import { VcProductActionsButton } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcProductActionsButton",
  component: VcProductActionsButton,
} as Meta<typeof VcProductActionsButton>;

const Template: StoryFn = (args) => ({
  components: { VcProductActionsButton },
  setup: () => ({ args }),
  template: '<VcProductActionsButton v-bind="args" />',
});

export const Basic = Template.bind({});

export const Active = Template.bind({});
Active.args = {
  icon: "compare",
  active: true,
};

export const ActiveColor = Template.bind({});
ActiveColor.args = {
  active: true,
  color: "danger",
};

export const IconSize = Template.bind({});
IconSize.args = {
  active: true,
  color: "danger",
  iconSize: "xs",
};
