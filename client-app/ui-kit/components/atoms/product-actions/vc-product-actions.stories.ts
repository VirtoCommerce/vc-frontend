import { VcProductActions } from "..";
import { VcProductActionsButton } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcProductActions",
  component: VcProductActions,
} as Meta<typeof VcProductActions>;

const Template: StoryFn = (args) => ({
  components: { VcProductActions, VcProductActionsButton },
  setup: () => ({ args }),
  template: `<VcProductActions v-bind="args">
  <VcProductActionsButton
    color="danger"
    active
    tooltip-text="VcProductActionsButton"
  />
  <VcProductActionsButton
    icon="compare"
    active
    tooltip-text="VcProductActionsButton"
  />
  </VcProductActions>`,
});

export const Basic = Template.bind({});

export const Vertical = Template.bind({});
Vertical.args = {
  direction: "vertical",
};

export const VerticalWithBg = Template.bind({});
VerticalWithBg.args = {
  direction: "vertical",
  withBackground: true,
};
