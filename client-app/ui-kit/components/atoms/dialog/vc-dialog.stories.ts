import { VcDialog } from "..";
import { VcDialogHeader, VcDialogContent, VcDialogFooter } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

export default {
  title: "Components/Atoms/VcDialog",
  component: VcDialog,
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcDialog>;

const Template: StoryFn = (args) => ({
  components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
  setup: () => ({ args }),
  template: `
    <VcDialog v-bind="args">
      <VcDialogHeader>Title</VcDialogHeader>
      <VcDialogContent>Content</VcDialogContent>
      <VcDialogFooter />
    </VcDialog>
  `,
});

export const Basic = Template.bind({});

export const Dividers = Template.bind({});
Dividers.args = {
  dividers: true,
};

const TemplateIcon: StoryFn = (args) => ({
  components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
  setup: () => ({ args }),
  template: `
    <VcDialog v-bind="args">
      <VcDialogHeader icon="check">Title</VcDialogHeader>
      <VcDialogContent>Content</VcDialogContent>
      <VcDialogFooter />
    </VcDialog>
  `,
});

export const Icon = TemplateIcon.bind({});
Icon.args = {
  icon: "check",
};
