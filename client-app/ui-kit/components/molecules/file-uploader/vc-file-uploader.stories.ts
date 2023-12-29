import { VcFileUploader } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcFileUploader",
  component: VcFileUploader,
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: ["horizontal", "vertical"],
        },
      },
    },
  },
} as Meta<typeof VcFileUploader>;

const Template: StoryFn<typeof VcFileUploader> = (args) => ({
  components: { VcFileUploader },
  setup: () => ({ args }),
  template: '<VcFileUploader v-bind="args" />',
});

export const Basic = Template.bind({});
