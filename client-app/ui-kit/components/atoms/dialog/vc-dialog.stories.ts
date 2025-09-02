import { VcDialog } from "..";
import { VcDialogHeader, VcDialogContent, VcDialogFooter } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcDialog",
  component: VcDialog,
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
