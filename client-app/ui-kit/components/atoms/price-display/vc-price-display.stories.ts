import { Meta, StoryFn } from "@storybook/vue3";
import { VcPriceDisplay } from "..";

export default {
  title: "Components/Atoms/VcPriceDisplay",
  component: VcPriceDisplay,
} as Meta<typeof VcPriceDisplay>;

const Template: StoryFn<typeof VcPriceDisplay> = (args) => ({
  components: { VcPriceDisplay },
  setup: () => ({ args }),
  template: '<VcPriceDisplay v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: {
    formattedAmount: "$1000.99",
  },
};
