import { Meta, StoryFn } from "@storybook/vue3";
import VcLabel from "./vc-label.vue";

export default {
  title: "Label",
  component: VcLabel,
} as Meta<typeof VcLabel>;

const Template: StoryFn<typeof VcLabel> = (args) => ({
  components: { VcLabel },
  setup() {
    return { args };
  },
  template: '<VcLabel v-bind="args">Label</VcLabel>',
});

export const Label = Template.bind({});

export const LabelRequired = Template.bind({});
LabelRequired.args = {
  required: true,
};

export const LabelError = Template.bind({});
LabelError.args = {
  required: true,
  error: true,
};
