import { VcProductProperties } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductProperties> = {
  title: "Components/Atoms/VcProductProperties",
  component: VcProductProperties,
  render: () => ({
    template: `<VcProductProperties>
      <VcProperty label="Color">Blue</VcProperty>
      <VcProperty label="Size">XL</VcProperty>
      <VcProperty label="Material">Cotton</VcProperty>
    </VcProductProperties>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `
          <VcProductProperties>
            <VcProperty label="Color">Blue</VcProperty>
            <VcProperty label="Size">XL</VcProperty>
            <VcProperty label="Material">Cotton</VcProperty>
          </VcProductProperties>
        `,
      },
    },
  },
};
