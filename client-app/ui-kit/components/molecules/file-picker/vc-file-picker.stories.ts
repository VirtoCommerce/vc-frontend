import { VcFilePicker } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcFilePicker",
  component: VcFilePicker,
  argTypes: {
    allowedExtensions: { control: { type: "object" } },
    files: { control: { type: "object" } },
  },
} as Meta<typeof VcFilePicker>;

const Template: StoryFn = (args) => ({
  components: { VcFilePicker },
  setup: () => ({ args }),
  template: '<VcFilePicker v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  allowedExtensions: ["jpg", "png"],
  files: [],
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  disabled: true,
};

export const Requirements = Template.bind({});
Requirements.args = {
  ...Basic.args,
  requirements: "The files available for upload are in JPG, PNG formats. Each file should not exceed 1MB.",
};
