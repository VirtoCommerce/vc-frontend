import { Dialog } from "@headlessui/vue";
import { VcDialog } from "..";
import { VcDialogHeader, VcDialogContent, VcDialogFooter } from "../../molecules";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcDialog",
  component: VcDialog,
} as Meta<typeof VcDialog>;

const Template: StoryFn = (args) => ({
  components: { Dialog, VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
  setup: () => ({ args }),
  template: `<Dialog v-bind="{ open: true, as: 'div' }">
    <VcDialog v-bind="args">
      <VcDialogHeader>Title</VcDialogHeader>
      <VcDialogContent>Content</VcDialogContent>
      <VcDialogFooter>
      </VcDialogFooter>
    </VcDialog>
  </Dialog>`,
});

export const Basic = Template.bind({});

export const Dividers = Template.bind({});
Dividers.args = {
  dividers: true,
};
