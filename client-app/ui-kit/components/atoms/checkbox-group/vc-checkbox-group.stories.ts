import { VcCheckbox, VcCheckboxGroup } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcCheckboxGroup",
  component: VcCheckboxGroup,
} as Meta<typeof VcCheckboxGroup>;

const Template: StoryFn = (args) => ({
  components: { VcCheckbox, VcCheckboxGroup },
  setup: () => ({ args }),
  template: `<VcCheckboxGroup v-bind="args" class="space-y-3">
  <VcCheckbox value="1">Checkbox 1</VcCheckbox>
  <VcCheckbox value="2">Checkbox 2</VcCheckbox>
  <VcCheckbox value="3">Checkbox 3</VcCheckbox>
  <VcCheckbox value="4">Checkbox 4</VcCheckbox>
  <VcCheckbox value="5">Checkbox 5</VcCheckbox>
  </VcCheckboxGroup>`,
});

export const Basic = Template.bind({});

export const Selected = Template.bind({});
Selected.args = {
  modelValue: ["2", "4", "5"],
};
