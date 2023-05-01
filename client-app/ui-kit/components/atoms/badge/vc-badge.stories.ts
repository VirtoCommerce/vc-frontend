import { VcBadge } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcBadge",
  component: VcBadge,
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"xs" | "sm" | "md"',
        },
      },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "info", "neutral", "warning", "danger"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger"',
        },
      },
    },
    variant: {
      control: "select",
      options: ["solid", "solid-light", "outline", "outline-dark"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"solid" | "solid-light" | "outline" | "outline-dark"',
        },
      },
    },
  },
  args: {
    size: "md",
    color: "primary",
    variant: "solid",
  },
} as Meta<typeof VcBadge>;

const Template: StoryFn<typeof VcBadge> = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: '<VcBadge v-bind="args">Badge</VcBadge>',
});

export const Basic = Template.bind({});
