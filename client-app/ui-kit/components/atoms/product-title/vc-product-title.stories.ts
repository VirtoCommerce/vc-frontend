import { VcProductTitle } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const TARGETS = ["_blank", "_self"];

export default {
  title: "Components/Atoms/VcProductTitle",
  component: VcProductTitle,
  argTypes: {
    target: {
      control: "inline-radio",
      options: TARGETS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: TARGETS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcProductTitle>;

const Template: StoryFn = (args) => ({
  components: { VcProductTitle },
  setup: () => ({ args }),
  template: '<VcProductTitle class="text-sm" v-bind="args">Product title</VcProductTitle>',
});

export const Basic = Template.bind({});

export const Link = Template.bind({});
Link.args = {
  to: "/link",
};

export const Disabled = Template.bind({});
Disabled.args = {
  to: "/link",
  disabled: true,
};

export const Responsive: StoryFn = (args) => ({
  components: { VcProductTitle },
  setup: () => ({ args }),
  template: '<VcProductTitle class="text-lg md:text-sm" v-bind="args">Product title</VcProductTitle>',
});
