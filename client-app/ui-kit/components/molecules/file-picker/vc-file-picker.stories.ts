import { VcFilePicker } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcFilePicker",
  component: VcFilePicker,
} as Meta<typeof VcFilePicker>;

const Template: StoryFn<typeof VcFilePicker> = (args) => ({
  components: { VcFilePicker },
  setup: () => ({ args }),
  template: '<VcFilePicker v-bind="args" />',
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Requirements = Template.bind({});
Requirements.args = {
  requirements: "The files available for upload are in JPG, PNG formats. Each file should not exceed 1MB.",
};
