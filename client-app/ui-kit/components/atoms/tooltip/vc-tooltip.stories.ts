import { VcTooltip } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
];

const meta: Meta<typeof VcTooltip> = {
  title: "Components/Atoms/VcTooltip",
  component: VcTooltip,
  argTypes: {
    placement: {
      control: "select",
      options: PLACEMENTS,
      description: "Preferred placement of the tooltip relative to the trigger",
    },
    disabled: {
      control: "boolean",
      description: "Prevents the tooltip from showing",
    },
    hover: {
      control: "boolean",
      description: "Opens on hover (true by default)",
    },
    width: {
      control: "text",
      description: "Tooltip content width",
    },
  },
  args: {
    placement: "bottom",
    disabled: false,
    hover: true,
  },
  decorators: [
    () => ({
      template: '<div class="flex justify-center p-16"><story /></div>',
    }),
  ],
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcTooltip v-bind="args">
      <template #trigger>
        <VcButton>Hover over me</VcButton>
      </template>
      <template #content>Tooltip text</template>
    </VcTooltip>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcTooltip>
            <template #trigger>
              <VcButton>Hover over me</VcButton>
            </template>
            <template #content>Tooltip text</template>
          </VcTooltip>
        `,
      },
    },
  },
};

export const TopPlacement: StoryType = {
  args: {
    placement: "top",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcTooltip v-bind="args">
      <template #trigger>
        <VcButton>Hover — tooltip above</VcButton>
      </template>
      <template #content>Tooltip on top</template>
    </VcTooltip>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcTooltip placement="top">
            <template #trigger>
              <VcButton>Hover me</VcButton>
            </template>
            <template #content>Tooltip on top</template>
          </VcTooltip>
        `,
      },
    },
  },
};

export const ClickTrigger: StoryType = {
  args: {
    hover: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcTooltip v-bind="args">
      <template #trigger>
        <VcButton>Click to show tooltip</VcButton>
      </template>
      <template #content>Click-triggered tooltip</template>
    </VcTooltip>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcTooltip :hover="false">
            <template #trigger>
              <VcButton>Click to show tooltip</VcButton>
            </template>
            <template #content>Click-triggered tooltip</template>
          </VcTooltip>
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcTooltip v-bind="args">
      <template #trigger>
        <VcButton>Hover me (disabled tooltip)</VcButton>
      </template>
      <template #content>This will never show</template>
    </VcTooltip>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcTooltip disabled>
            <template #trigger>
              <VcButton>Hover me (disabled tooltip)</VcButton>
            </template>
            <template #content>This will never show</template>
          </VcTooltip>
        `,
      },
    },
  },
};
