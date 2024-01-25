import { VcFile } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcFile",
  component: VcFile,
} as Meta<typeof VcFile>;

const Template: StoryFn<typeof VcFile> = (args) => ({
  components: { VcFile },
  setup: () => ({ args }),
  template: '<VcFile v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  file: {
    name: "File-name.pdf",
    size: 11122233,
    contentType: "application/pdf",
    progress: 45,
    status: "loading",
  },
};
