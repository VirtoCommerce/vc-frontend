import { VcDropdownMenu } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcDropdownMenu> = {
  title: "Components/Molecules/VcDropdownMenu",
  component: VcDropdownMenu,
  render: (args) => ({
    setup: () => ({ args }),
    template: `
  <VcDropdownMenu v-bind="args">
    <template #trigger="{ triggerProps }">
      <span v-bind="triggerProps">Trigger</span>
    </template>

    <template #content>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 1</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 2</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 3</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 4</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 5</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 6</span>
      </VcMenuItem>
      <VcMenuItem>
        <VcIcon name="compare" />
        <span>Menu item 7</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>

  <div class="h-52"></div>
  `,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};
