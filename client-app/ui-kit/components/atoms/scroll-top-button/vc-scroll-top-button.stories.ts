import { VcScrollTopButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcScrollTopButton> = {
  title: "Components/Atoms/VcScrollTopButton",
  component: VcScrollTopButton,
  parameters: {
    docs: {
      description: {
        component:
          "A fixed-position button that appears in the bottom-right corner when the user scrolls more than 20px down the page. Clicking it smoothly scrolls back to the top.",
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  decorators: [
    () => ({
      template: `<div style="height: 200vh; position: relative;">
        <p class="p-4 text-sm text-neutral-600">Scroll down to see the button appear.</p>
        <story />
      </div>`,
    }),
  ],
  render: () => ({
    template: "<VcScrollTopButton />",
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcScrollTopButton />`,
      },
    },
  },
};
