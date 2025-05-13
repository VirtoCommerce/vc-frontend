import { VcDropdownMenu, VcMenuItem } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcDropdownMenu",
  component: VcDropdownMenu,
} as Meta<typeof VcMenuItem>;

const Template: StoryFn = (args) => ({
  components: { VcDropdownMenu, VcMenuItem, VcIcon },
  setup: () => ({ args }),
  template: `
  <VcDropdownMenu v-bind="args">
    <template #trigger>
      <span>Trigger</span>
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
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
