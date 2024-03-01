import { VcNotification } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Organisms/VcNotification",
  component: VcNotification,
} as Meta<typeof VcNotification>;

const Template: StoryFn<typeof VcNotification> = (args) => ({
  components: { VcNotification },
  setup: () => ({ args }),
  template: '<VcNotification v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {};
