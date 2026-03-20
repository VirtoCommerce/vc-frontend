import { VcExpansionPanel } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcExpansionPanel> = {
  title: "Components/Molecules/VcExpansionPanel",
  component: VcExpansionPanel,
  argTypes: {
    title: {
      control: "text",
      description: "Panel header title",
    },
    expanded: {
      control: "boolean",
      description: "Whether the panel is expanded by default",
    },
  },
  args: {
    title: "Panel title",
    expanded: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanel v-bind="args">
      <p class="text-sm text-neutral-600 leading-relaxed">
        This is the panel content. Click the header to expand or collapse.
      </p>
    </VcExpansionPanel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanel title="Panel title">
            <p class="text-sm text-neutral-600">Panel content goes here.</p>
          </VcExpansionPanel>
        `,
      },
    },
  },
};

export const Expanded: StoryType = {
  args: {
    expanded: true,
    title: "Expanded by default",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanel v-bind="args">
      <p class="text-sm text-neutral-600 leading-relaxed">
        This panel is expanded by default. It will still toggle when the header is clicked.
      </p>
    </VcExpansionPanel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanel title="Expanded by default" :expanded="true">
            <p class="text-sm text-neutral-600">Content visible on load.</p>
          </VcExpansionPanel>
        `,
      },
    },
  },
};

export const WithIcon: StoryType = {
  args: {
    title: "Shipping details",
    expanded: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanel v-bind="args">
      <template #icon>
        <VcIcon name="truck" class="fill-primary" />
      </template>
      <p class="text-sm text-neutral-600 leading-relaxed">
        Standard shipping takes 3–5 business days. Express shipping is available
        at checkout for an additional fee.
      </p>
    </VcExpansionPanel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanel title="Shipping details" :expanded="true">
            <template #icon>
              <VcIcon name="truck" class="fill-primary" />
            </template>
            <p class="text-sm text-neutral-600">Shipping information here.</p>
          </VcExpansionPanel>
        `,
      },
    },
  },
};
