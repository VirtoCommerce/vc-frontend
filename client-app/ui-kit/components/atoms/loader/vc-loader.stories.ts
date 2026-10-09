import { VcLoader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLoader> = {
  title: "Components/Atoms/VcLoader",
  component: VcLoader,
  render: () => ({
    template: "<VcLoader />",
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `<VcLoader />`,
      },
    },
  },
};

export const InContext: StoryType = {
  render: () => ({
    template: `<div class="flex items-center gap-3 text-sm text-neutral-600">
      <VcLoader />
      <span>Loading...</span>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <div class="flex items-center gap-3">
            <VcLoader />
            <span>Loading...</span>
          </div>
        `,
      },
    },
  },
};
