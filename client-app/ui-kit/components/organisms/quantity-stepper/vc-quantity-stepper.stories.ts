import { ref } from "vue";
import { VcQuantityStepper } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["sm", "md"];

export default {
  title: "Components/Organisms/VcQuantityStepper",
  component: VcQuantityStepper,
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    size: {
      control: "radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcQuantityStepper>;

const Template: StoryFn = (args) => ({
  components: { VcQuantityStepper },
  setup: () => {
    const localValue = ref(args.value ?? 0);
    return { args, localValue };
  },
  template: `
    <VcQuantityStepper
      v-bind="args"
      v-model="localValue"
    />
  `,
});

export const Basic = Template.bind({});

export const MinMax = Template.bind({});
MinMax.args = {
  min: 3,
  max: 10,
  value: 3,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  value: 0,
};

export const Readonly = Template.bind({});
Readonly.args = {
  readonly: true,
  value: 5,
};

export const Errored = Template.bind({});
Errored.args = {
  error: true,
  message: "Error message",
  value: 5,
};

export const SelectOnClick = Template.bind({});
SelectOnClick.args = {
  selectOnClick: true,
  value: 5,
};
