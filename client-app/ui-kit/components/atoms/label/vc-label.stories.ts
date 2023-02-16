import VcLabel from "./vc-label.vue";

import { Meta, StoryFn } from "@storybook/vue3";

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

//👇 Each story then reuses that template
export const Label = Template.bind({});
Label.args = {
  required: true,
};
