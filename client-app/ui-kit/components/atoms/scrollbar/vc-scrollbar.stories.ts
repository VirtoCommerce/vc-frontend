import { VcScrollbar } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcScrollbar",
  component: VcScrollbar,
  argTypes: {},
} as Meta<typeof VcScrollbar>;

const Template: StoryFn<typeof VcScrollbar> = (args) => ({
  components: { VcScrollbar },
  setup: () => ({ args }),
  template: `<VcScrollbar v-bind="args" class="h-44">
    <div class="flex gap-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
    <div class="flex gap-3 mt-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
    <div class="flex gap-3 mt-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
  </VcScrollbar>`,
});

export const Basic = Template.bind({});

export const Horizontal = Template.bind({});
Horizontal.args = {
  vertical: false,
  horizontal: true,
};

export const VerticalHorizontal = Template.bind({});
VerticalHorizontal.args = {
  vertical: true,
  horizontal: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...VerticalHorizontal.args,
  disabled: true,
};
