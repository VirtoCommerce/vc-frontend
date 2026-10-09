import { ref } from "vue";
import { VcCheckboxGroup } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcCheckboxGroup> = {
  title: "Components/Atoms/VcCheckboxGroup",
  component: VcCheckboxGroup,
  argTypes: {
    modelValue: {
      control: "object",
      description: "Array of selected checkbox values",
    },
  },
  render: (args) => ({
    setup: () => {
      const model = ref<(string | number | object)[]>(args.modelValue ?? []);
      return { args, model };
    },
    template: `<VcCheckboxGroup v-model="model" v-bind="args" class="space-y-3">
      <VcCheckbox value="1">Checkbox 1</VcCheckbox>
      <VcCheckbox value="2">Checkbox 2</VcCheckbox>
      <VcCheckbox value="3">Checkbox 3</VcCheckbox>
      <VcCheckbox value="4">Checkbox 4</VcCheckbox>
      <VcCheckbox value="5">Checkbox 5</VcCheckbox>
    </VcCheckboxGroup>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    modelValue: [],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcCheckboxGroup>
            <VcCheckbox value="1">Checkbox 1</VcCheckbox>
            <VcCheckbox value="2">Checkbox 2</VcCheckbox>
            <VcCheckbox value="3">Checkbox 3</VcCheckbox>
            <VcCheckbox value="4">Checkbox 4</VcCheckbox>
            <VcCheckbox value="5">Checkbox 5</VcCheckbox>
          </VcCheckboxGroup>
        `,
      },
    },
  },
};

export const Selected: StoryType = {
  args: {
    modelValue: ["2", "4", "5"],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcCheckboxGroup :model-value="['2', '4', '5']">
            <VcCheckbox value="1">Checkbox 1</VcCheckbox>
            <VcCheckbox value="2">Checkbox 2</VcCheckbox>
            <VcCheckbox value="3">Checkbox 3</VcCheckbox>
            <VcCheckbox value="4">Checkbox 4</VcCheckbox>
            <VcCheckbox value="5">Checkbox 5</VcCheckbox>
          </VcCheckboxGroup>
        `,
      },
    },
  },
};
