import { VcDateSelector } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcDateSelector",
  component: VcDateSelector,
  argTypes: {
    required: {
      control: "boolean",
      table: { type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      table: { type: { summary: "boolean" } },
    },
    min: {
      control: "date",
      table: { type: { summary: "string" } },
    },
    max: {
      control: "date",
      table: { type: { summary: "string" } },
    },
    errorMessage: {
      control: "text",
      table: { type: { summary: "string" } },
    },
  },
  args: {
    label: "Choose date",
    modelValue: undefined,
    required: false,
    disabled: false,
    min: undefined,
    max: undefined,
    errorMessage: "",
  },
} as Meta<typeof VcDateSelector>;

const Template: StoryFn = (args) => ({
  components: { VcDateSelector },
  setup: () => ({ args }),
  template: `
    <div class="w-64">
      <VcDateSelector v-bind="args" />
    </div>
  `,
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const WithMinMax = Template.bind({});
WithMinMax.args = {
  min: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
  max: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  errorMessage: "Date is required",
  required: true,
};
