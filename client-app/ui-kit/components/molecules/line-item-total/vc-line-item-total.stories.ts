import { getMoney } from "@/ui-kit/mocks";
import { VcLineItemTotal } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcLineItemTotal",
  component: VcLineItemTotal,
} as Meta<typeof VcLineItemTotal>;

const Template: StoryFn = (args) => ({
  components: { VcLineItemTotal },
  setup: () => ({ args }),
  template: '<VcLineItemTotal v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  listTotal: getMoney(2000),
  actualTotal: getMoney(1000),
};
