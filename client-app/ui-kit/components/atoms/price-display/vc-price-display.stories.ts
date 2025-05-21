import { getMoney } from "@/ui-kit/mocks";
import { VcPriceDisplay } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcPriceDisplay",
  component: VcPriceDisplay,
} as Meta<typeof VcPriceDisplay>;

const Template: StoryFn = (args) => ({
  components: { VcPriceDisplay },
  setup: () => ({ args }),
  template: '<VcPriceDisplay v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: getMoney(1000.99),
};
