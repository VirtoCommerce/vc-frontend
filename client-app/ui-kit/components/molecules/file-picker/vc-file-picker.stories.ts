import { VcFilePicker } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcFilePicker> = {
  title: "Components/Molecules/VcFilePicker",
  component: VcFilePicker,
  argTypes: {
    allowedExtensions: { control: { type: "object" } },
    files: { control: { type: "object" } },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcFilePicker v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const basicArgs = {
  allowedExtensions: ["jpg", "png"],
  files: [],
};

export const Basic: StoryType = {
  args: basicArgs,
};

export const Disabled: StoryType = {
  args: {
    ...basicArgs,
    disabled: true,
  },
};

export const Requirements: StoryType = {
  args: {
    ...basicArgs,
    requirements: "The files available for upload are in JPG, PNG formats. Each file should not exceed 1MB.",
  },
};
