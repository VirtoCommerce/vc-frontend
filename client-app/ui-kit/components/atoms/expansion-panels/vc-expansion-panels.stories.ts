import { VcExpansionPanels } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcExpansionPanels> = {
  title: "Components/Atoms/VcExpansionPanels",
  component: VcExpansionPanels,
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Allows multiple panels to be expanded simultaneously",
    },
  },
  args: {
    multiple: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanels class="flex flex-col gap-y-4" v-bind="args">
      <VcExpansionPanel title="Shipping information">
        <p class="text-sm text-neutral-600 leading-relaxed">
          We offer free standard shipping on all orders over $50. Delivery typically takes 3–5 business days.
          Express shipping is available at checkout for an additional fee.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Returns & exchanges">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Items can be returned within 30 days of purchase in their original condition.
          Start a return from your order history page and we will send a prepaid shipping label.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Product care">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Machine wash cold with like colors. Tumble dry on low heat.
          Do not bleach. Iron on low if needed.
        </p>
      </VcExpansionPanel>
    </VcExpansionPanels>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanels class="flex flex-col gap-y-4">
            <VcExpansionPanel title="Shipping information">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Returns & exchanges">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Product care">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
          </VcExpansionPanels>
        `,
      },
    },
  },
};

export const Multiple: StoryType = {
  args: {
    multiple: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanels class="flex flex-col gap-y-4" v-bind="args">
      <VcExpansionPanel title="Shipping information" :expanded="true">
        <p class="text-sm text-neutral-600 leading-relaxed">
          We offer free standard shipping on all orders over $50. Delivery typically takes 3–5 business days.
          Express shipping is available at checkout for an additional fee.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Returns & exchanges" :expanded="true">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Items can be returned within 30 days of purchase in their original condition.
          Start a return from your order history page and we will send a prepaid shipping label.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Product care">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Machine wash cold with like colors. Tumble dry on low heat.
          Do not bleach. Iron on low if needed.
        </p>
      </VcExpansionPanel>
    </VcExpansionPanels>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanels class="flex flex-col gap-y-4" multiple>
            <VcExpansionPanel title="Shipping information" :expanded="true">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Returns & exchanges" :expanded="true">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Product care">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
          </VcExpansionPanels>
        `,
      },
    },
  },
};

export const SingleExpanded: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcExpansionPanels class="flex flex-col gap-y-4" v-bind="args">
      <VcExpansionPanel title="Shipping information" :expanded="true">
        <p class="text-sm text-neutral-600 leading-relaxed">
          We offer free standard shipping on all orders over $50. Delivery typically takes 3–5 business days.
          Express shipping is available at checkout for an additional fee.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Returns & exchanges">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Items can be returned within 30 days of purchase in their original condition.
          Start a return from your order history page and we will send a prepaid shipping label.
        </p>
      </VcExpansionPanel>
      <VcExpansionPanel title="Product care">
        <p class="text-sm text-neutral-600 leading-relaxed">
          Machine wash cold with like colors. Tumble dry on low heat.
          Do not bleach. Iron on low if needed.
        </p>
      </VcExpansionPanel>
    </VcExpansionPanels>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcExpansionPanels class="flex flex-col gap-y-4">
            <VcExpansionPanel title="Shipping information" :expanded="true">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Returns & exchanges">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
            <VcExpansionPanel title="Product care">
              <p class="text-sm text-neutral-600">...</p>
            </VcExpansionPanel>
          </VcExpansionPanels>
        `,
      },
    },
  },
};
